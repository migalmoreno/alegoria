interface ImageMeta {
  device: string;
}

export interface Image {
  url: string;
  category?: string;
  subcategory?: string;
  extension?: string;
  filename?: string;
  domain?: string;
  date?: Date;
  description?: string;
  meta?: ImageMeta;
  authorThumbnail?: string;
  authorName?: string;
  authorUrl?: string;
  videoUrl?: string;
  type?: string;
  groupName?: string;
  groupUrl?: string;
  groupThumbnail?: string;
}

export interface Video {
  url: string;
}
