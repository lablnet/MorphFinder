import Foundation
import NodeAPI

#NodeModule(exports: [
    "getMetadata": try NodeFunction { (path: String) in
        try NativeJSON.encode(SpotlightMeta.read(path: path))
    },
    "setTags": try NodeFunction { (path: String, tagsJSON: String) throws -> Void in
        let tags = try NativeJSON.decoder.decode([FinderTag].self, from: Data(tagsJSON.utf8))
        try FinderTags.write(path: path, tags: tags)
    },
    "getThumbnail": try NodeFunction { (path: String, width: Double, height: Double, scale: Double) in
        try NativeJSON.encode(Thumbnails.generate(path: path, width: width, height: height, scale: scale))
    },
    "getOpenWithApps": try NodeFunction { (path: String) in
        try NativeJSON.encode(OpenWith.list(path: path))
    },
])
