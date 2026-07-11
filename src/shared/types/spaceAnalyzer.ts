export interface SpaceAnalyzerNode {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  fileCount: number;
  children?: SpaceAnalyzerNode[];
}

export interface SpaceAnalyzerResult {
  rootNode: SpaceAnalyzerNode;
  diskTotal: number;
  diskFree: number;
}
