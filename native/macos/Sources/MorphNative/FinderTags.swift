import Foundation

enum FinderTags {
    static func read(path: String) throws -> [FinderTag] {
        let url = URL(fileURLWithPath: path)
        let values = try url.resourceValues(forKeys: [.tagNamesKey, .labelNumberKey])
        let names = values.tagNames ?? []
        let label = values.labelNumber ?? 0
        return names.enumerated().map { index, name in
            FinderTag(name: name, colorIndex: index == 0 ? label : 0)
        }
    }

    static func write(path: String, tags: [FinderTag]) throws {
        let url = URL(fileURLWithPath: path) as NSURL
        try url.setResourceValue(tags.map(\.name), forKey: .tagNamesKey)
        try url.setResourceValue(tags.first?.colorIndex ?? 0, forKey: .labelNumberKey)
    }
}
