import Foundation
import AppKit

struct SystemLocation: Codable {
    let id: String
    let name: String
    let path: String
    let iconType: String
    let isRemovable: Bool
    let isInternal: Bool
}

enum Locations {
    static func list() -> [SystemLocation] {
        var results: [SystemLocation] = []
        var addedPaths = Set<String>()

        let keys: [URLResourceKey] = [
            .volumeNameKey,
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
                addedPaths.insert(path)

                let values = try? url.resourceValues(forKeys: Set(keys))
                let name = values?.volumeName ?? url.lastPathComponent
                let isRemovable = values?.volumeIsRemovable ?? false
                let isInternal = values?.volumeIsInternal ?? false
                let isEjectable = values?.volumeIsEjectable ?? false
                
                let iconType: String
                if path == "/" {
                    iconType = "hd"
                } else if isRemovable || isEjectable || !isInternal {
                    iconType = "removable"
                } else {
                    iconType = "hd"
                }

                results.append(SystemLocation(
                    id: path,
                    name: name,
                    path: path,
                    iconType: iconType,
                    isRemovable: isRemovable || isEjectable,
                    isInternal: isInternal
                ))
            }
        }

        // Ensure "/" is present if not caught above
        if !addedPaths.contains("/") {
            addedPaths.insert("/")
            results.insert(SystemLocation(
                id: "/",
                name: "Macintosh HD",
                path: "/",
                iconType: "hd",
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
                    // Ignore hidden files
                    if item.hasPrefix(".") { continue }
                    let fullPath = (cloudStoragePath as NSString).appendingPathComponent(item)
                    if !addedPaths.contains(fullPath) {
                        addedPaths.insert(fullPath)
                        // E.g. "GoogleDrive-email" -> "Google Drive"
                        var cleanName = item
                        if item.contains("-") {
                            cleanName = item.components(separatedBy: "-").first?.trimmingCharacters(in: .whitespaces) ?? item
                        }
                        // Insert cloud items right after root volume
                        results.append(SystemLocation(
                            id: fullPath,
                            name: cleanName,
                            path: fullPath,
                            iconType: "cloud",
                            isRemovable: false,
                            isInternal: true
                        ))
                    }
                }
            }
        }

        // iCloud Drive standard path fallback if not found in CloudStorage
        let iCloudPath = homeDir.appendingPathComponent("Library/Mobile Documents/com~apple~CloudDocs").path
        if FileManager.default.fileExists(atPath: iCloudPath) && !addedPaths.contains(iCloudPath) {
            addedPaths.insert(iCloudPath)
            results.append(SystemLocation(
                id: iCloudPath,
                name: "iCloud Drive",
                path: iCloudPath,
                iconType: "cloud",
                isRemovable: false,
                isInternal: true
            ))
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
                iconType: "home",
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
                iconType: "trash",
                isRemovable: false,
                isInternal: true
            ))
        }

        return results
    }
}
