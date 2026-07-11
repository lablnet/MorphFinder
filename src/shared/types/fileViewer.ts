/** Which in-app viewer to use for a given file. */
export type FileViewerMode =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'text'
  | 'code'
  | 'markdown'
  | 'office'
  | 'unknown';

/** Response shape for the `fs:readFile` IPC channel. */
export interface FileContentResponse {
  content: string;
  encoding: 'utf-8' | 'base64';
  /** True when the file was larger than `maxBytes` and was truncated. */
  truncated: boolean;
  totalBytes: number;
}

// ---------------------------------------------------------------------------
// Extension → viewer mode map
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif',
] as const;

const VIDEO_EXTENSIONS = [
  'mp4', 'webm', 'mkv', 'mov', 'avi', 'ogv', 'wmv', 'm4v', 'flv', '3gp',
] as const;

const AUDIO_EXTENSIONS = [
  'mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'opus', 'aiff', 'ape',
] as const;

const CODE_EXTENSIONS = [
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts',
  'py', 'rb', 'rs', 'go', 'java', 'kt', 'kts', 'scala',
  'c', 'h', 'cpp', 'hpp', 'cc', 'cxx', 'cs',
  'swift', 'dart', 'lua', 'r', 'pl', 'pm', 'php',
  'sh', 'bash', 'zsh', 'fish', 'bat', 'ps1', 'psm1',
  'html', 'htm', 'css', 'scss', 'sass', 'less', 'styl',
  'json', 'jsonc', 'json5', 'yaml', 'yml', 'toml', 'ini', 'cfg',
  'xml', 'xsl', 'xslt', 'xsd', 'dtd',
  'sql', 'graphql', 'gql', 'prisma',
  'dockerfile', 'makefile', 'cmake',
  'vue', 'svelte', 'astro',
  'ex', 'exs', 'erl', 'hrl', 'hs', 'lhs', 'elm', 'clj', 'cljs',
  'tf', 'hcl', 'nix', 'zig', 'nim', 'v', 'wasm', 'wat',
] as const;

const TEXT_EXTENSIONS = [
  'txt', 'log', 'csv', 'tsv', 'env', 'gitignore', 'gitattributes',
  'editorconfig', 'prettierrc', 'eslintrc', 'npmrc', 'nvmrc',
  'conf', 'config', 'properties', 'plist',
  'rtf', 'diff', 'patch',
] as const;

const OFFICE_EXTENSIONS = [
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'odt', 'ods', 'odp', 'pages', 'numbers', 'key',
] as const;

function buildExtensionMap(): ReadonlyMap<string, FileViewerMode> {
  const map = new Map<string, FileViewerMode>();
  for (const ext of IMAGE_EXTENSIONS) map.set(ext, 'image');
  for (const ext of VIDEO_EXTENSIONS) map.set(ext, 'video');
  for (const ext of AUDIO_EXTENSIONS) map.set(ext, 'audio');
  for (const ext of CODE_EXTENSIONS) map.set(ext, 'code');
  for (const ext of TEXT_EXTENSIONS) map.set(ext, 'text');
  for (const ext of OFFICE_EXTENSIONS) map.set(ext, 'office');
  map.set('pdf', 'pdf');
  map.set('md', 'markdown');
  map.set('mdx', 'markdown');
  map.set('markdown', 'markdown');
  return map;
}

export const FILE_EXTENSION_MAP: ReadonlyMap<string, FileViewerMode> = buildExtensionMap();

/** Resolve the viewer mode for a given file extension (lowercased, without leading dot). */
export function viewerModeForExtension(extension: string): FileViewerMode {
  return FILE_EXTENSION_MAP.get(extension.toLowerCase()) ?? 'unknown';
}

/** Maximum bytes we'll read through the `fs:readFile` IPC channel. */
export const MAX_FILE_READ_BYTES = 5 * 1024 * 1024; // 5 MB
