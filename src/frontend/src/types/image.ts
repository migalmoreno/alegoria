interface ImageMeta {
  device: string;
}

export interface Image {
  url: string;
  user: string;
  category?: string;
  subcategory?: string;
  extension?: string;
  filename?: string;
  domain?: string;
  date?: Date;
  description?: string;
  meta?: ImageMeta;
  authorThumbnail?: string;
  authorUrl?: string;
  videoUrl?: string;
  type?: string;
}

export interface Video {
  url: string;
}
