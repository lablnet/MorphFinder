import Foundation

struct FinderTag: Codable {
    let name: String
    let colorIndex: Int
}

struct NativeMetadata: Codable {
    let tags: [FinderTag]
    let spotlightKind: String?
    let spotlightComment: String?
}

struct NativeThumbnail: Codable {
    let dataUrl: String
    let width: Int
    let height: Int
}

struct OpenWithApp: Codable {
    let name: String
    let bundleId: String
    let iconDataUrl: String?
    let isDefault: Bool
}

enum NativeJSON {
    static let encoder = JSONEncoder()
    static let decoder = JSONDecoder()

    static func encode<T: Encodable>(_ value: T) throws -> String {
        let data = try encoder.encode(value)
        guard let json = String(data: data, encoding: .utf8) else {
            throw CocoaError(.fileWriteInapplicableStringEncoding)
        }
        return json
    }
}
