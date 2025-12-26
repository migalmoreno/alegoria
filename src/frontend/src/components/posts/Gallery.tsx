import { PostResponse, GalleryExtractor, ImagePost } from "../../types";
import { ImagePostContainer } from "./PostContainer";
import { ItemsContainer, ItemsPaginationContainer } from "./Items";

interface GalleryProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: GalleryExtractor<T>;
}

export const Gallery = <T,>(props: GalleryProps<T>) => {
  return (
    <ItemsContainer
      {...props}
      extractors={[props.extractor]}
      itemsContainerComponent={<ItemsPaginationContainer />}
      itemRenderer={(post) => <ImagePostContainer post={post as ImagePost} />}
    />
  );
};
