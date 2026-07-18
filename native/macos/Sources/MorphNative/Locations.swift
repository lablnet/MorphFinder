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

        let keys: [URLResourceKey] = [
            .volumeNameKey,
            .localizedNameKey,
            .volumeIsRemovableKey,
            .volumeIsInternalKey,
            .volumeIsLocalKey,
            .volumeIsEjectableKey
        ]
        
        // 1. Mounted volumes (Macintosh HD, External SSDs, MacDroid, etc.)
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

        let homeDir = FileManager.default.homeDirectoryForCurrentUser

        // 2. Cloud Storage (iCloud Drive, Google Drive in ~/Library/CloudStorage)
        let cloudStoragePath = homeDir.appendingPathComponent("Library/CloudStorage").path
        if FileManager.default.fileExists(atPath: cloudStoragePath) {
            if let items = try? FileManager.default.contentsOfDirectory(atPath: cloudStoragePath) {
                for item in items {
                    if item.hasPrefix(".") { continue }
                    let fullPath = (cloudStoragePath as NSString).appendingPathComponent(item)
                    guard !addedPaths.contains(fullPath) else { continue }

                    // Determine readable localized display name
                    let url = URL(fileURLWithPath: fullPath)
                    let values = try? url.resourceValues(forKeys: [.localizedNameKey])
                    var name = values?.localizedName ?? item

                    if name == item && item.contains("-") {
                        name = item.components(separatedBy: "-").first?.trimmingCharacters(in: .whitespaces) ?? item
                    }

                    // Avoid duplicate location names (e.g. redundant iCloudDrive mounts)
                    if addedNames.contains(name) {
                        continue
                    }

                    addedPaths.insert(fullPath)
                    addedNames.insert(name)

                    results.append(SystemLocation(
                        id: fullPath,
                        name: name,
                        path: fullPath,
                        iconDataUrl: getIconDataUrl(forPath: fullPath),
                        isRemovable: false,
                        isInternal: true
                    ))
                }
            }
        }

        // 3. User Home Directory
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

        // 4. Trash
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
