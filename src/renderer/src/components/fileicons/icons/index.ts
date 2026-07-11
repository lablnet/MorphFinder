import type React from 'react';
import type { IconProps } from '../FileTemplates';

import { FolderIcon } from './FolderIcon';
import { PythonIcon } from './PythonIcon';
import { PhpIcon } from './PhpIcon';
import { JsIcon } from './JsIcon';
import { TsIcon } from './TsIcon';
import { CppIcon } from './CppIcon';
import { RustIcon } from './RustIcon';
import { GoIcon } from './GoIcon';
import { JavaIcon } from './JavaIcon';
import { SwiftIcon } from './SwiftIcon';
import { RubyIcon } from './RubyIcon';
import { CSharpIcon } from './CSharpIcon';
import { KotlinIcon } from './KotlinIcon';
import { LuaIcon } from './LuaIcon';
import { DartIcon } from './DartIcon';
import { HtmlIcon } from './HtmlIcon';
import { CssIcon } from './CssIcon';
import { PdfIcon } from './PdfIcon';
import { WordIcon } from './WordIcon';
import { ExcelIcon } from './ExcelIcon';
import { PptIcon } from './PptIcon';
import { TextIcon } from './TextIcon';
import { MarkdownIcon } from './MarkdownIcon';
import { ConfigIcon } from './ConfigIcon';
import { FontIcon } from './FontIcon';
import { GitIcon } from './GitIcon';
import { ZipIcon } from './ZipIcon';
import { ExeIcon } from './ExeIcon';
import { DmgIcon } from './DmgIcon';
import { DockerIcon } from './DockerIcon';
import { DbIcon } from './DbIcon';
import { AudioFileIcon } from './AudioFileIcon';
import { VideoFileIcon } from './VideoFileIcon';
import { DefaultFileIcon } from './DefaultFileIcon';
import { ImageIcon } from './ImageIcon';
import { LockIcon } from './LockIcon';
import { BookIcon } from './BookIcon';

export { FolderIcon, DefaultFileIcon };

export const CUSTOM_ICONS: Record<string, React.FC<IconProps>> = {
  // Programming languages
  py: PythonIcon,
  php: PhpIcon,
  js: JsIcon,
  jsx: JsIcon,
  ts: TsIcon,
  tsx: TsIcon,
  c: CppIcon,
  cpp: CppIcon,
  cc: CppIcon,
  h: CppIcon,
  hpp: CppIcon,
  rs: RustIcon,
  go: GoIcon,
  java: JavaIcon,
  class: JavaIcon,
  jar: JavaIcon,
  swift: SwiftIcon,
  rb: RubyIcon,
  cs: CSharpIcon,
  kt: KotlinIcon,
  kts: KotlinIcon,
  lua: LuaIcon,
  dart: DartIcon,
  html: HtmlIcon,
  htm: HtmlIcon,
  css: CssIcon,
  scss: CssIcon,
  sass: CssIcon,
  less: CssIcon,

  // Configurations, scripts & data formats
  json: ConfigIcon,
  yaml: ConfigIcon,
  yml: ConfigIcon,
  toml: ConfigIcon,
  ini: ConfigIcon,
  conf: ConfigIcon,
  config: ConfigIcon,
  env: ConfigIcon,
  xml: ConfigIcon,
  wasm: ConfigIcon,

  // Docker
  docker: DockerIcon,
  dockerfile: DockerIcon,
  dockerignore: DockerIcon,

  // Database
  sql: DbIcon,
  db: DbIcon,
  sqlite: DbIcon,
  mysql: DbIcon,
  pgsql: DbIcon,

  // Git configs
  gitignore: GitIcon,
  gitconfig: GitIcon,
  gitattributes: GitIcon,

  // Documents
  pdf: PdfIcon,
  doc: WordIcon,
  docx: WordIcon,
  pages: WordIcon,
  xls: ExcelIcon,
  xlsx: ExcelIcon,
  csv: ExcelIcon,
  numbers: ExcelIcon,
  ppt: PptIcon,
  pptx: PptIcon,
  key: PptIcon,
  txt: TextIcon,
  rtf: TextIcon,
  log: TextIcon,
  md: MarkdownIcon,
  epub: BookIcon,
  mobi: BookIcon,

  // Fonts
  ttf: FontIcon,
  otf: FontIcon,
  woff: FontIcon,
  woff2: FontIcon,
  eot: FontIcon,

  // Archives
  zip: ZipIcon,
  rar: ZipIcon,
  '7z': ZipIcon,
  tar: ZipIcon,
  gz: ZipIcon,
  tgz: ZipIcon,
  bz2: ZipIcon,
  xz: ZipIcon,

  // Executables & Installers
  exe: ExeIcon,
  dmg: DmgIcon,
  pkg: DmgIcon,
  app: ExeIcon,
  sh: ExeIcon,
  bash: ExeIcon,
  zsh: ExeIcon,
  command: ExeIcon,
  bat: ExeIcon,
  cmd: ExeIcon,

  // Media Fallbacks
  mp3: AudioFileIcon,
  wav: AudioFileIcon,
  flac: AudioFileIcon,
  aac: AudioFileIcon,
  ogg: AudioFileIcon,
  m4a: AudioFileIcon,
  wma: AudioFileIcon,
  mp4: VideoFileIcon,
  mov: VideoFileIcon,
  mkv: VideoFileIcon,
  avi: VideoFileIcon,
  webm: VideoFileIcon,
  flv: VideoFileIcon,

  // Images Fallbacks (if native QuickLook generator fails)
  png: ImageIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  gif: ImageIcon,
  webp: ImageIcon,
  svg: ImageIcon,
  heic: ImageIcon,
  tiff: ImageIcon,
  bmp: ImageIcon,

  // Lockfiles
  lock: LockIcon,
};
