export interface VscoGalleryPost {
  category: string;
  subcategory: string;
  user: string;
}

export interface VscoMeta {
  aperture: number;
  captureDate: number;
  copyright: string;
  extension: number;
  fileHash: string;
  fileSize: number;
  flashMode: string;
  flashValue: number;
  iso: number;
  make: string;
  model: string;
  orientation: number;
  shutterSpeed: string;
  software: string;
  whiteBalance: string;
}

export interface VscoGalleryItem {
  date: string;
  description: string;
  grid: string;
  height: number;
  filename: string;
  id: string;
  video: boolean;
  user: string;
  width: number;
  tags: string[];
  category: "vsco";
  extension: string;
  meta: VscoMeta;
}
