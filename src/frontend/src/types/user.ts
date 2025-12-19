export interface UserPost {
  thumbnail: string;
  url: string;
}

export interface UserStats {
  mediaCount?: number;
  following?: number;
  followers?: number;
  likeCount?: number;
}

export interface UserInfo {
  thumbnail?: string;
  name?: string;
  nickname?: string;
  verified?: boolean;
  stats?: UserStats;
  category?: string;
  bio?: string;
  bioLink?: string;
  private?: boolean;
}

export interface User extends UserInfo {
  posts: UserPost[];
}

interface BaseExtractor {
  fetchUrl?: string;
  urlMatcher?: RegExp;
  unique?: true;
  originalUrl?: boolean;
  type: string;
}

export interface InfoExtractor<T> extends BaseExtractor {
  type: "info";
  extractor: (data: T) => UserInfo;
}

export interface GalleryExtractor<T> extends BaseExtractor {
  type: "gallery";
  batch?: boolean;
  extractor: (data: T) => UserPost[];
}

export interface PostExtractor<T> extends BaseExtractor {
  type: "post";
  extractor: (data: T) => UserPost;
}

export type UserExtractor<T> =
  | InfoExtractor<T>
  | GalleryExtractor<T>
  | PostExtractor<T>;
