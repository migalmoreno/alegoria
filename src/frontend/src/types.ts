export interface SubCategory {
  example: string;
  name: string;
  category: string;
  description?: string;
  searchable?: boolean;
}

export interface Category {
  name: string;
  subcategories: SubCategory[];
  root?: string;
  base_pattern?: string;
  description?: string;
  domains?: string[];
  legacy_domains?: string[];
}

export interface Extractor {
  category: string;
  subcategory: string;
  groups: string[];
  config_path: string[];
  url: string;
  filters?: string[];
}

export interface GalleryItem {
  thumbnail?: string;
  url?: string;
  authorName?: string;
  authorThumbnail?: string;
  authorUrl?: string;
  groupName?: string;
  groupThumbnail?: string;
  groupUrl?: string;
}

export interface GalleryResponse {
  renderer: "gallery";
  items: GalleryItem[];
}

export interface ImageStats {
  likes?: number;
  plays?: number;
  comments?: number;
  shares?: number;
  score?: number;
  saves?: number;
}

export interface ImageResponse {
  renderer: "image";
  url: string;
  videoUrl?: string;
  posterUrl?: string;
  type?: string;
  description?: string;
  authorName?: string;
  authorUrl?: string;
  authorThumbnail?: string;
  date?: string;
  filename?: string;
  groupName?: string;
  groupThumbnail?: string;
  groupUrl?: string;
  stats?: ImageStats;
}

export interface UserInfoData {
  name?: string;
  thumbnail?: string;
  verified?: boolean;
  bio?: string;
  nickname?: string;
  category?: string;
  private?: boolean;
  stats?: {
    followers?: number;
    following?: number;
    mediaCount?: number;
    likeCount?: number;
  };
}

export interface UserInfoResponse extends UserInfoData {
  renderer: "user-info";
}

export interface UserProfileResponse {
  renderer: "user-profile";
  avatarUrl?: string;
  galleryUrl?: string;
}

export interface BoardItem {
  name?: string;
  thumbnail?: string;
  url: string;
  count?: number;
  score?: number;
  date?: string;
  description?: string;
  groupName?: string;
  groupUrl?: string;
  groupThumbnail?: string;
}

export interface GroupBoardResponse {
  renderer: "group-board";
  items: BoardItem[];
}

export interface MediaBoardResponse {
  renderer: "media-board";
  items: BoardItem[];
  columns?: number;
}

export interface ThreadPost {
  no?: number;
  title?: string;
  com?: string;
  name?: string;
  authorUrl?: string;
  date?: string;
  thumbnail?: string;
  url?: string;
  mediaType?: string;
  sourceUrl?: string;
  postUrl?: string;
  score?: number;
  count?: number;
  groupName?: string;
  groupUrl?: string;
  groupThumbnail?: string;
  filename?: string;
  resto?: number;
}

export interface ThreadResponse {
  renderer: "thread";
  items: ThreadPost[];
}

export type PageResponse =
  | GalleryResponse
  | ImageResponse
  | GroupBoardResponse
  | MediaBoardResponse
  | ThreadResponse
  | UserInfoResponse
  | UserProfileResponse;
