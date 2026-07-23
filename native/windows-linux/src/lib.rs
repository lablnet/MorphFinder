use base64::Engine;
use napi::Result;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Cursor;
use std::path::Path;
use std::process::Command;

#[derive(Deserialize, Serialize)]
struct FinderTag {
    name: String,
    #[serde(rename = "colorIndex")]
    color_index: i32,
}

#[derive(Serialize)]
struct NativeMetadata {
    tags: Vec<FinderTag>,
    #[serde(rename = "spotlightKind")]
    spotlight_kind: Option<String>,
    #[serde(rename = "spotlightComment")]
    spotlight_comment: Option<String>,
}

#[derive(Serialize)]
struct NativeThumbnail {
    #[serde(rename = "dataUrl")]
    data_url: String,
    width: i32,
    height: i32,
}

#[derive(Deserialize, Serialize)]
struct OpenWithApp {
    name: String,
    #[serde(rename = "bundleId")]
    bundle_id: String,
    #[serde(rename = "iconDataUrl")]
    icon_data_url: Option<String>,
    #[serde(rename = "isDefault")]
    is_default: bool,
}

fn json<T: Serialize>(value: &T) -> Result<String> {
    serde_json::to_string(value)
        .map_err(|error| napi::Error::from_reason(format!("failed to encode native JSON: {error}")))
}

fn command_output(command: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(command).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let value = String::from_utf8(output.stdout).ok()?.trim().to_owned();
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn extension_kind(path: &str) -> Option<String> {
    Path::new(path)
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| format!("{} File", extension.to_uppercase()))
}

fn read_png_thumbnail(path: &Path) -> Option<NativeThumbnail> {
    let data = fs::read(path).ok()?;
    let decoder = png::Decoder::new(Cursor::new(&data));
    let reader = decoder.read_info().ok()?;
    let info = reader.info();
    Some(NativeThumbnail {
        data_url: format!(
            "data:image/png;base64,{}",
            base64::engine::general_purpose::STANDARD.encode(data)
        ),
        width: info.width as i32,
        height: info.height as i32,
    })
}

#[cfg(target_os = "windows")]
mod thumbnail {
    use super::*;
    use std::ffi::OsStr;
    use std::iter;
    use std::mem::{size_of, zeroed};
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::{HBITMAP, HWND, SIZE};
    use windows::Win32::Graphics::Gdi::{
        DeleteObject, GetDC, GetDIBits, GetObjectW, ReleaseDC, BITMAP, BITMAPFILEHEADER,
        BITMAPINFO, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
    };
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED,
    };
    use windows::Win32::UI::Shell::{
        IShellItemImageFactory, SHCreateItemFromParsingName, SIIGBF_BIGGERSIZEOK,
    };

    struct ComScope;

    impl ComScope {
        fn new() -> Option<Self> {
            unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()? };
            Some(Self)
        }
    }

    impl Drop for ComScope {
        fn drop(&mut self) {
            unsafe { CoUninitialize() };
        }
    }

    struct BitmapHandle(HBITMAP);

    impl Drop for BitmapHandle {
        fn drop(&mut self) {
            unsafe {
                let _ = DeleteObject(self.0);
            }
        }
    }

    fn wide(value: &str) -> Vec<u16> {
        OsStr::new(value)
            .encode_wide()
            .chain(iter::once(0))
            .collect()
    }

    fn bitmap_to_bmp_data_url(bitmap: HBITMAP) -> Option<NativeThumbnail> {
        unsafe {
            let mut bitmap_info: BITMAP = zeroed();
            let object_size = GetObjectW(
                bitmap,
                size_of::<BITMAP>() as i32,
                Some((&mut bitmap_info as *mut BITMAP).cast()),
            );
            if object_size == 0 || bitmap_info.bmWidth <= 0 || bitmap_info.bmHeight == 0 {
                return None;
            }

            let width = bitmap_info.bmWidth;
            let height = bitmap_info.bmHeight.abs();
            let mut info = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: width,
                    biHeight: -height,
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: BI_RGB.0,
                    ..zeroed()
                },
                ..zeroed()
            };

            let stride = width as usize * 4;
            let image_size = stride * height as usize;
            let mut pixels = vec![0_u8; image_size];
            let dc = GetDC(HWND(0));
            if dc.0 == 0 {
                return None;
            }
            let scan_lines = GetDIBits(
                dc,
                bitmap,
                0,
                height as u32,
                Some(pixels.as_mut_ptr().cast()),
                &mut info,
                DIB_RGB_COLORS,
            );
            let _ = ReleaseDC(HWND(0), dc);
            if scan_lines == 0 {
                return None;
            }

            let file_header_size = size_of::<BITMAPFILEHEADER>();
            let info_header_size = size_of::<BITMAPINFOHEADER>();
            let pixel_offset = file_header_size + info_header_size;
            let file_size = pixel_offset + pixels.len();
            let mut bmp = Vec::with_capacity(file_size);
            bmp.extend_from_slice(b"BM");
            bmp.extend_from_slice(&(file_size as u32).to_le_bytes());
            bmp.extend_from_slice(&[0_u8; 4]);
            bmp.extend_from_slice(&(pixel_offset as u32).to_le_bytes());
            bmp.extend_from_slice(&(info.bmiHeader.biSize).to_le_bytes());
            bmp.extend_from_slice(&(info.bmiHeader.biWidth).to_le_bytes());
            bmp.extend_from_slice(&(height).to_le_bytes());
            bmp.extend_from_slice(&(info.bmiHeader.biPlanes).to_le_bytes());
            bmp.extend_from_slice(&(info.bmiHeader.biBitCount).to_le_bytes());
            bmp.extend_from_slice(&(info.bmiHeader.biCompression).to_le_bytes());
            bmp.extend_from_slice(&(image_size as u32).to_le_bytes());
            bmp.extend_from_slice(&0_i32.to_le_bytes());
            bmp.extend_from_slice(&0_i32.to_le_bytes());
            bmp.extend_from_slice(&0_u32.to_le_bytes());
            bmp.extend_from_slice(&0_u32.to_le_bytes());
            bmp.extend_from_slice(&pixels);

            Some(NativeThumbnail {
                data_url: format!(
                    "data:image/bmp;base64,{}",
                    base64::engine::general_purpose::STANDARD.encode(bmp)
                ),
                width,
                height,
            })
        }
    }

    pub fn generate(path: &str, width: f64, height: f64, scale: f64) -> Option<NativeThumbnail> {
        let _com = ComScope::new()?;
        let requested = SIZE {
            cx: (width * scale).round().max(1.0) as i32,
            cy: (height * scale).round().max(1.0) as i32,
        };
        let path = wide(path);
        unsafe {
            let item: IShellItemImageFactory =
                SHCreateItemFromParsingName(PCWSTR(path.as_ptr()), None).ok()?;
            let bitmap = item.GetImage(requested, SIIGBF_BIGGERSIZEOK).ok()?;
            let bitmap = BitmapHandle(bitmap);
            bitmap_to_bmp_data_url(bitmap.0)
        }
    }
}

#[cfg(target_os = "linux")]
mod thumbnail {
    use super::*;
    use std::env;
    use std::path::PathBuf;

    fn file_uri(path: &str) -> Option<String> {
        let absolute = fs::canonicalize(path).ok()?;
        let value = absolute.to_string_lossy();
        Some(format!("file://{}", urlencoding::encode(&value).replace("%2F", "/")))
    }

    fn thumbnail_cache_paths(path: &str) -> Vec<PathBuf> {
        let Some(uri) = file_uri(path) else {
            return Vec::new();
        };
        let digest = format!("{:x}", md5::compute(uri.as_bytes()));
        let home = env::var_os("HOME").map(PathBuf::from);
        let cache_home = env::var_os("XDG_CACHE_HOME")
            .map(PathBuf::from)
            .or_else(|| home.as_ref().map(|home| home.join(".cache")));
        let Some(cache_home) = cache_home else {
            return Vec::new();
        };
        ["large", "normal", "x-large", "xx-large"]
            .into_iter()
            .map(|size| cache_home.join("thumbnails").join(size).join(format!("{digest}.png")))
            .collect()
    }

    fn generate_with_thumbnailer(path: &str, output: &Path, width: f64, height: f64) -> bool {
        let size = width.max(height).round().max(1.0).to_string();
        let output = output.to_string_lossy().to_string();
        let geometry = format!("{size}x{size}");
        let candidates: [(&str, Vec<String>); 3] = [
            ("gdk-pixbuf-thumbnailer", vec!["-s".into(), size.clone(), path.into(), output.clone()]),
            ("ffmpegthumbnailer", vec!["-i".into(), path.into(), "-o".into(), output.clone(), "-s".into(), size]),
            ("convert", vec![path.into(), "-thumbnail".into(), geometry, output]),
        ];

        candidates.iter().any(|(command, args)| {
            Command::new(command)
                .args(args.iter().map(String::as_str))
                .status()
                .map(|status| status.success())
                .unwrap_or(false)
        })
    }

    pub fn generate(path: &str, width: f64, height: f64, _scale: f64) -> Option<NativeThumbnail> {
        for cached in thumbnail_cache_paths(path) {
            if cached.exists() {
                if let Some(thumbnail) = read_png_thumbnail(&cached) {
                    return Some(thumbnail);
                }
            }
        }

        let output = thumbnail_cache_paths(path).into_iter().next()?;
        fs::create_dir_all(output.parent()?).ok()?;
        if generate_with_thumbnailer(path, &output, width, height) {
            return read_png_thumbnail(&output);
        }
        None
    }
}

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
mod thumbnail {
    use super::*;

    pub fn generate(_path: &str, _width: f64, _height: f64, _scale: f64) -> Option<NativeThumbnail> {
        None
    }
}

#[cfg(target_os = "windows")]
fn platform_metadata(path: &str) -> NativeMetadata {
    let escaped_path = path.replace('\'', "''");
    let script = format!(
        "$item = Get-Item -LiteralPath '{escaped_path}' -ErrorAction Stop; \
         $shell = New-Object -ComObject Shell.Application; \
         $folder = $shell.Namespace($item.DirectoryName); \
         $folderItem = $folder.ParseName($item.Name); \
         $kind = $folder.GetDetailsOf($folderItem, 2); \
         $comment = $folder.GetDetailsOf($folderItem, 24); \
         [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; \
         [System.Text.Json.JsonSerializer]::Serialize(@{{ kind = $kind; comment = $comment }})"
    );
    let parsed = command_output(
        "powershell.exe",
        &["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", &script],
    )
    .and_then(|value| serde_json::from_str::<serde_json::Value>(&value).ok());

    NativeMetadata {
        tags: Vec::new(),
        spotlight_kind: parsed
            .as_ref()
            .and_then(|value| value.get("kind"))
            .and_then(|value| value.as_str())
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_owned)
            .or_else(|| extension_kind(path)),
        spotlight_comment: parsed
            .as_ref()
            .and_then(|value| value.get("comment"))
            .and_then(|value| value.as_str())
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_owned),
    }
}

#[cfg(target_os = "linux")]
fn platform_metadata(path: &str) -> NativeMetadata {
    NativeMetadata {
        tags: Vec::new(),
        spotlight_kind: command_output("xdg-mime", &["query", "filetype", path])
            .or_else(|| command_output("file", &["--brief", "--mime-type", path])),
        spotlight_comment: None,
    }
}

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
fn platform_metadata(_path: &str) -> NativeMetadata {
    NativeMetadata {
        tags: Vec::new(),
        spotlight_kind: None,
        spotlight_comment: None,
    }
}

#[cfg(target_os = "windows")]
fn platform_open_with_apps(path: &str) -> Vec<OpenWithApp> {
    let Some(extension) = Path::new(path).extension().and_then(|value| value.to_str()) else {
        return Vec::new();
    };
    let extension = format!(".{}", extension.replace('\'', "''"));
    let script = format!(
        "$progId = (Get-ItemProperty -LiteralPath 'Registry::HKEY_CLASSES_ROOT\\{extension}' -ErrorAction SilentlyContinue).'(default)'; \
         if ($progId) {{ [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [System.Text.Json.JsonSerializer]::Serialize(@(@{{ name = $progId; bundleId = $progId; iconDataUrl = $null; isDefault = $true }})) }}"
    );
    let Some(output) = command_output(
        "powershell.exe",
        &["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", &script],
    ) else {
        return Vec::new();
    };
    serde_json::from_str(&output).unwrap_or_default()
}

#[cfg(target_os = "linux")]
fn platform_open_with_apps(path: &str) -> Vec<OpenWithApp> {
    let Some(mime_type) = command_output("xdg-mime", &["query", "filetype", path]) else {
        return Vec::new();
    };
    let Some(default_app) = command_output("xdg-mime", &["query", "default", &mime_type]) else {
        return Vec::new();
    };
    let name = default_app
        .trim_end_matches(".desktop")
        .replace('-', " ");
    vec![OpenWithApp {
        name,
        bundle_id: default_app,
        icon_data_url: None,
        is_default: true,
    }]
}

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
fn platform_open_with_apps(_path: &str) -> Vec<OpenWithApp> {
    Vec::new()
}

#[napi(js_name = "getMetadata")]
pub fn get_metadata(path: String) -> Result<String> {
    json(&platform_metadata(&path))
}

#[napi(js_name = "setTags")]
pub fn set_tags(_path: String, _tags_json: String) -> Result<()> {
    Ok(())
}

#[napi(js_name = "getThumbnail")]
pub fn get_thumbnail(path: String, width: f64, height: f64, scale: f64) -> Result<String> {
    json(&thumbnail::generate(&path, width, height, scale))
}

#[napi(js_name = "getOpenWithApps")]
pub fn get_open_with_apps(path: String) -> Result<String> {
    json(&platform_open_with_apps(&path))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_json_encoding() {
        let tag = FinderTag {
            name: "Important".to_string(),
            color_index: 1,
        };
        let encoded = json(&tag).unwrap();
        assert!(encoded.contains("Important"));
        assert!(encoded.contains("colorIndex"));
    }

    #[test]
    fn test_metadata_serialization() {
        let meta = NativeMetadata {
            tags: vec![],
            spotlight_kind: Some("PDF Document".to_string()),
            spotlight_comment: None,
        };
        let encoded = json(&meta).unwrap();
        assert!(encoded.contains("PDF Document"));
    }
}
