export interface DirectoryAnnotationTag {
  id: string;
  label: string;
  color: string;
}

export interface DirectoryAnnotation {
  path: string;
  tags: DirectoryAnnotationTag[];
  notes: string;
  updatedAt: number;
}

export type DirectoryAnnotationUpdate = Pick<DirectoryAnnotation, 'path' | 'tags' | 'notes'>;
