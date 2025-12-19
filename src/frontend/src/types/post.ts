export interface PostMetadata<T, U = T> {
  metadata: T[];
  post: U[];
  urls: string;
}

export interface PostResponse<T, U = T, V = T> {
  metadata: (PostMetadata<V> & T)[];
  post: U[];
  urls: string[];
}
