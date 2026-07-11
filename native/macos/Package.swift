// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "MorphNative",
    platforms: [.macOS(.v12)],
    products: [
        .library(name: "MorphNative", type: .dynamic, targets: ["MorphNative"]),
    ],
    dependencies: [
        .package(path: "../../node_modules/node-swift"),
    ],
    targets: [
        .target(
            name: "MorphNative",
            dependencies: [
                .product(name: "NodeAPI", package: "node-swift"),
                .product(name: "NodeModuleSupport", package: "node-swift"),
            ],
            linkerSettings: [
                .linkedFramework("AppKit"),
                .linkedFramework("QuickLookThumbnailing"),
            ]
        ),
    ],
    swiftLanguageModes: [.v6]
)
