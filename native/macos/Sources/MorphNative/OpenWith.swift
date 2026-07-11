import AppKit
import Foundation

enum OpenWith {
    static func list(path: String) -> [OpenWithApp] {
        let fileURL = URL(fileURLWithPath: path)
        let workspace = NSWorkspace.shared
        let defaultURL = workspace.urlForApplication(toOpen: fileURL)

        return workspace.urlsForApplications(toOpen: fileURL)
            .reduce(into: [URL]()) { apps, url in
                if !apps.contains(url) { apps.append(url) }
            }
            .map { url in
                let bundle = Bundle(url: url)
                let icon = workspace.icon(forFile: url.path)
                let iconData = icon.tiffRepresentation
                    .flatMap(NSBitmapImageRep.init(data:))?
                    .representation(using: .png, properties: [:])
                return OpenWithApp(
                    name: bundle?.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String
                        ?? bundle?.object(forInfoDictionaryKey: "CFBundleName") as? String
                        ?? url.deletingPathExtension().lastPathComponent,
                    bundleId: bundle?.bundleIdentifier ?? "",
                    iconDataUrl: iconData.map { "data:image/png;base64,\($0.base64EncodedString())" },
                    isDefault: url == defaultURL
                )
            }
            .sorted { lhs, rhs in
                if lhs.isDefault != rhs.isDefault { return lhs.isDefault }
                return lhs.name.localizedStandardCompare(rhs.name) == .orderedAscending
            }
    }
}
