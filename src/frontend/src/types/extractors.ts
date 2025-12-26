export interface ImagePost {
  thumbnail: string;
  url: string;
  authorName?: string;
  authorUrl?: string;
  authorThumbnail?: string;
  groupName?: string;
  groupThumbnail?: string;
  groupUrl?: string;
}

export interface BoardPost {
  name: string;
  thumbnail: string;
  url: string;
  count?: number;
  date?: Date;
}

export interface BaseExtractor {
  fetchUrl?: string;
  urlMatcher?: RegExp;
  unique?: true;
  originalUrl?: boolean;
  type: string;
}

export interface GalleryExtractor<T> extends BaseExtractor {
  type: "gallery";
  extractor: (data: T) => ImagePost[];
}

export interface PostExtractor<T> extends BaseExtractor {
  type: "post";
  extractor: (data: T) => ImagePost;
}

export interface GroupBoardExtractor<T> extends BaseExtractor {
  type: "group-board";
  extractor: (data: T) => BoardPost[];
}

export interface MediaBoardExtractor<T> extends BaseExtractor {
  type: "media-board";
  extractor: (data: T) => BoardPost[];
}

export type ItemsExtractor<T> = (
  | GalleryExtractor<T>
  | GroupBoardExtractor<T>
  | MediaBoardExtractor<T>
  | PostExtractor<T>
) & {
  batch?: boolean;
};
