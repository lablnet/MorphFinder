import Foundation
import AppKit

struct SystemLocation: Codable {
    let id: String
    let name: String
    let path: String
    let iconDataUrl: String?
    let isRemovable: Bool
    let isInternal: Bool
}

enum Locations {
    private static func getIconDataUrl(forPath path: String) -> String? {
        let image = NSWorkspace.shared.icon(forFile: path)
        image.size = NSSize(width: 32, height: 32)
        guard let tiffData = image.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiffData),
              let pngData = bitmap.representation(using: .png, properties: [:]) else {
            return nil
        }
        return "data:image/png;base64," + pngData.base64EncodedString()
    }

    static func list() -> [SystemLocation] {
        var results: [SystemLocation] = []
        var addedPaths = Set<String>()
        var addedNames = Set<String>()

        let homeDir = FileManager.default.homeDirectoryForCurrentUser

        // 1. iCloud Drive (Only show if iCloud sync is enabled & active)
        let isICloudSyncEnabled = FileManager.default.ubiquityIdentityToken != nil
        let iCloudPath = homeDir.appendingPathComponent("Library/Mobile Documents/com~apple~CloudDocs").path
        
        if isICloudSyncEnabled && FileManager.default.fileExists(atPath: iCloudPath) {
            addedPaths.insert(iCloudPath)
            addedNames.insert("iCloud Drive")
            
            let iCloudAppPath = "/System/Library/CoreServices/Finder.app/Contents/Applications/iCloud Drive.app"
            let iconPath = FileManager.default.fileExists(atPath: iCloudAppPath) ? iCloudAppPath : iCloudPath

            results.append(SystemLocation(
                id: iCloudPath,
                name: "iCloud Drive",
                path: iCloudPath,
                iconDataUrl: getIconDataUrl(forPath: iconPath),
                isRemovable: false,
                isInternal: true
            ))
        }

        // 2. Mounted volumes (Macintosh HD, External SSDs, MacDroid, etc.)
        let keys: [URLResourceKey] = [
            .volumeNameKey,
            .localizedNameKey,
            .volumeIsRemovableKey,
            .volumeIsInternalKey,
            .volumeIsLocalKey,
            .volumeIsEjectableKey
        ]
        
        if let urls = FileManager.default.mountedVolumeURLs(includingResourceValuesForKeys: keys, options: [.skipHiddenVolumes]) {
            for url in urls {
                let path = url.path
                guard !addedPaths.contains(path) else { continue }
                
                let values = try? url.resourceValues(forKeys: Set(keys))
                let name = values?.localizedName ?? values?.volumeName ?? url.lastPathComponent
                let isRemovable = values?.volumeIsRemovable ?? false
                let isInternal = values?.volumeIsInternal ?? false
                let isEjectable = values?.volumeIsEjectable ?? false
                
                addedPaths.insert(path)
                addedNames.insert(name)

                results.append(SystemLocation(
                    id: path,
                    name: name,
                    path: path,
                    iconDataUrl: getIconDataUrl(forPath: path),
                    isRemovable: isRemovable || isEjectable,
                    isInternal: isInternal
                ))
            }
        }

        // Ensure "/" is present if not caught above
        if !addedPaths.contains("/") {
            addedPaths.insert("/")
            addedNames.insert("Macintosh HD")
            results.insert(SystemLocation(
                id: "/",
                name: "Macintosh HD",
                path: "/",
                iconDataUrl: getIconDataUrl(forPath: "/"),
                isRemovable: false,
                isInternal: true
            ), at: 0)
        }

        // 3. Cloud Storage Providers (Google Drive, OneDrive, Dropbox, etc.)
        // Skip raw internal `iCloudDrive-` container folders
        let cloudStoragePath = homeDir.appendingPathComponent("Library/CloudStorage").path
        if FileManager.default.fileExists(atPath: cloudStoragePath) {
            if let items = try? FileManager.default.contentsOfDirectory(atPath: cloudStoragePath) {
                for item in items {
                    if item.hasPrefix(".") || item.hasPrefix("iCloudDrive-") { continue }
                    let fullPath = (cloudStoragePath as NSString).appendingPathComponent(item)
                    guard !addedPaths.contains(fullPath) else { continue }

                    var providerName = item
                    if item.contains("-") {
                        let parts = item.components(separatedBy: "-")
                        providerName = parts.first?.trimmingCharacters(in: .whitespaces) ?? item
                    }
                    if providerName == "GoogleDrive" { providerName = "Google Drive" }
                    if providerName == "OneDrive" { providerName = "One Drive" }

                    if addedNames.contains(providerName) { continue }

                    addedPaths.insert(fullPath)
                    addedNames.insert(providerName)

                    results.append(SystemLocation(
                        id: fullPath,
                        name: providerName,
                        path: fullPath,
                        iconDataUrl: getIconDataUrl(forPath: fullPath),
                        isRemovable: false,
                        isInternal: true
                    ))
                }
            }
        }

        // 4. User Home Directory
        let userHomePath = homeDir.path
        if !addedPaths.contains(userHomePath) {
            addedPaths.insert(userHomePath)
            let userName = homeDir.lastPathComponent
            results.append(SystemLocation(
                id: userHomePath,
                name: userName,
                path: userHomePath,
                iconDataUrl: getIconDataUrl(forPath: userHomePath),
                isRemovable: false,
                isInternal: true
            ))
        }

        // 5. AirDrop
        let airDropPath = "/System/Library/CoreServices/Finder.app/Contents/Applications/AirDrop.app"
        if FileManager.default.fileExists(atPath: airDropPath) && !addedPaths.contains(airDropPath) {
            addedPaths.insert(airDropPath)
            results.append(SystemLocation(
                id: airDropPath,
                name: "AirDrop",
                path: airDropPath,
                iconDataUrl: getIconDataUrl(forPath: airDropPath),
                isRemovable: false,
                isInternal: true
            ))
        }

        // 6. Trash
        let trashPath = homeDir.appendingPathComponent(".Trash").path
        if FileManager.default.fileExists(atPath: trashPath) && !addedPaths.contains(trashPath) {
            addedPaths.insert(trashPath)
            results.append(SystemLocation(
                id: trashPath,
                name: "Trash",
                path: trashPath,
                iconDataUrl: getIconDataUrl(forPath: trashPath),
                isRemovable: false,
                isInternal: true
            ))
        }

        return results
    }
}
