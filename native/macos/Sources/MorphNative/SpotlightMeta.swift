import Foundation

enum SpotlightMeta {
    static func read(path: String) throws -> NativeMetadata {
        let item = NSMetadataItem(url: URL(fileURLWithPath: path))
        return NativeMetadata(
            tags: try FinderTags.read(path: path),
            spotlightKind: item?.value(forAttribute: "kMDItemKind") as? String,
            spotlightComment: item?.value(forAttribute: "kMDItemFinderComment") as? String
        )
    }
}
