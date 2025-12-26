import {
  PostResponse,
  BoardPost,
  MediaBoardExtractor,
  GroupBoardExtractor,
} from "~/types";
import { ItemsContainer, ItemsPaginationContainer } from "./Items";
import {
  GroupBoardPostContainer,
  MediaBoardPostContainer,
} from "./PostContainer";

interface GroupBoardProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: GroupBoardExtractor<T>;
}

export const GroupBoard = <T,>(props: GroupBoardProps<T>) => {
  return (
    <ItemsContainer
      {...props}
      extractors={[props.extractor]}
      itemsContainerComponent={<ItemsPaginationContainer />}
      itemRenderer={(post) => (
        <GroupBoardPostContainer
          extractor={props.extractor}
          post={post as BoardPost}
        />
      )}
    />
  );
};

interface MediaBoardProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: MediaBoardExtractor<T>;
}

export const MediaBoard = <T,>(props: MediaBoardProps<T>) => {
  return (
    <ItemsContainer
      {...props}
      extractors={[props.extractor]}
      itemsContainerComponent={<ItemsPaginationContainer />}
      itemRenderer={(post) => (
        <MediaBoardPostContainer post={post as BoardPost} />
      )}
    />
  );
};
