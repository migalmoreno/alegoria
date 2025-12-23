import { PostResponse, GalleryExtractor } from "../../types";
import { ImagePostContainer } from "./PostContainer";
import { UserItemsContainer } from "./UserItems";

interface UserGalleryProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: GalleryExtractor<T>;
}

export const UserGallery = <T,>(props: UserGalleryProps<T>) => {
  return (
    <UserItemsContainer
      {...props}
      itemRenderer={(post) => (
        <ImagePostContainer extractor={props.extractor} post={post} />
      )}
    />
  );
};
