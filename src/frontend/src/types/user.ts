export interface UserImagePost {
  thumbnail: string;
  url: string;
}

export interface UserBoardPost {
  name: string;
  thumbnail: string;
  url: string;
  count?: number;
  date?: Date;
}

export type UserItem = UserImagePost | UserBoardPost;

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
  posts: UserItem[];
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
  extractor: (data: T) => UserImagePost[];
}

export interface PostExtractor<T> extends BaseExtractor {
  type: "post";
  extractor: (data: T) => UserImagePost;
}

export interface BoardExtractor<T> extends BaseExtractor {
  type: "board";
  extractor: (data: T) => UserBoardPost[];
}

export type ItemsExtractor<T> = (GalleryExtractor<T> | BoardExtractor<T>) & {
  batch?: boolean;
};

export type UserExtractor<T> =
  | InfoExtractor<T>
  | ItemsExtractor<T>
  | PostExtractor<T>;
