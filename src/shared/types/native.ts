/** Finder tag as exposed by NSURL resource values: a label name plus its Finder color index. */
export interface FinderTag {
  name: string;
  colorIndex: number;
}

export interface NativeMetadata {
  tags: FinderTag[];
  spotlightKind: string | null;
  spotlightComment: string | null;
}

export interface OpenWithApp {
  name: string;
  bundleId: string;
  iconDataUrl: string | null;
  isDefault: boolean;
}

export interface NativeThumbnail {
  dataUrl: string;
  width: number;
  height: number;
}

/** Capability flags reported by nativeBridge so the renderer can hide UI for
 *  features the current platform/build doesn't back with the Swift addon. */
export interface NativeCapabilities {
  isAvailable: boolean;
  supportsTags: boolean;
  supportsThumbnails: boolean;
  supportsOpenWith: boolean;
}

export interface SystemLocation {
  id: string;
  name: string;
  path: string;
  iconType: string;
  isRemovable: boolean;
  isInternal: boolean;
}

