import {
  BaseExtractor,
  BoardPost,
  ImagePost,
  ItemsExtractor,
  PostExtractor,
} from "./extractors";

export type UserItem = ImagePost | BoardPost;

export interface UserStats {
  mediaCount?: number;
  following?: number;
  followers?: number;
  likeCount?: number;
}

export interface Info {
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

export interface User extends Info {
  posts: UserItem[];
}

export interface UserInfoExtractor<T> extends BaseExtractor {
  type: "info";
  extractor: (data: T) => Info;
}

export type UserExtractor<T> =
  | UserInfoExtractor<T>
  | ItemsExtractor<T>
  | PostExtractor<T>;
