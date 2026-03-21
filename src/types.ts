// ── Type Definitions ─────────────────────────────────────────────────────────

export type SaveMode = 'fixed' | 'note-relative';
export type ImageQuality = 'png' | 'jpeg-high' | 'jpeg-medium' | 'jpeg-low';
export type ImageResolution = 'original' | '1080p' | '720p' | '480p';
export type InsertFormat = 'wikilink' | 'markdown';

export interface CameraSettings {
  saveMode: SaveMode;
  fixedFolderPath: string;
  relativeSubfolderName: string;
  imageQuality: ImageQuality;
  imageResolution: ImageResolution;
  insertFormat: InsertFormat;
}

export const DEFAULT_SETTINGS: CameraSettings = {
  saveMode: 'fixed',
  fixedFolderPath: 'attachments/snaps',
  relativeSubfolderName: 'images',
  imageQuality: 'png',
  imageResolution: 'original',
  insertFormat: 'wikilink',
};

export const IMAGE_QUALITY_MAP: Record<ImageQuality, { label: string; mimeType: string; quality: number; ext: string }> = {
  'png':         { label: '无损 (PNG)',        mimeType: 'image/png',  quality: 1.00, ext: 'png' },
  'jpeg-high':   { label: '高质量 (JPEG 95%)', mimeType: 'image/jpeg', quality: 0.95, ext: 'jpg' },
  'jpeg-medium': { label: '中等 (JPEG 80%)',   mimeType: 'image/jpeg', quality: 0.80, ext: 'jpg' },
  'jpeg-low':    { label: '低质量 (JPEG 60%)', mimeType: 'image/jpeg', quality: 0.60, ext: 'jpg' },
};

export const IMAGE_RESOLUTION_MAP: Record<ImageResolution, { label: string; maxWidth: number }> = {
  'original': { label: '原始分辨率',  maxWidth: 0    },
  '1080p':    { label: '1080p (FHD)', maxWidth: 1920 },
  '720p':     { label: '720p (HD)',   maxWidth: 1280 },
  '480p':     { label: '480p (SD)',   maxWidth: 854  },
};
