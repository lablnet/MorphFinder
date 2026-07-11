import AppKit
import Foundation
@preconcurrency import QuickLookThumbnailing

private final class ThumbnailResultBox: @unchecked Sendable {
    private let lock = NSLock()
    private var result: Result<QLThumbnailRepresentation, Error>?

    func store(_ value: Result<QLThumbnailRepresentation, Error>) {
        lock.lock()
        result = value
        lock.unlock()
    }

    func load() -> Result<QLThumbnailRepresentation, Error>? {
        lock.lock()
        defer { lock.unlock() }
        return result
    }
}

enum Thumbnails {
    static func generate(path: String, width: Double, height: Double, scale: Double) throws -> NativeThumbnail {
        let request = QLThumbnailGenerator.Request(
            fileAt: URL(fileURLWithPath: path),
            size: NSSize(width: max(1, width), height: max(1, height)),
            scale: max(1, scale),
            representationTypes: .all
        )
        let semaphore = DispatchSemaphore(value: 0)
        let result = ThumbnailResultBox()

        QLThumbnailGenerator.shared.generateBestRepresentation(for: request) { representation, error in
            if let representation {
                result.store(.success(representation))
            } else {
                result.store(.failure(error ?? CocoaError(.fileReadUnknown)))
            }
            semaphore.signal()
        }
        semaphore.wait()

        guard let completed = result.load() else { throw CocoaError(.fileReadUnknown) }
        let representation = try completed.get()
        guard let tiff = representation.nsImage.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff),
              let png = bitmap.representation(using: .png, properties: [:]) else {
            throw CocoaError(.fileReadCorruptFile)
        }
        return NativeThumbnail(
            dataUrl: "data:image/png;base64,\(png.base64EncodedString())",
            width: bitmap.pixelsWide,
            height: bitmap.pixelsHigh
        )
    }
}
