import { BoardExtractor, PostResponse, UserBoardPost } from "~/types";
import { UserItemsContainer } from "./UserItems";
import { BoardPostContainer } from "./PostContainer";

interface UserBoardProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: BoardExtractor<T>;
}

export const UserBoard = <T,>(props: UserBoardProps<T>) => {
  return (
    <UserItemsContainer
      {...props}
      itemRenderer={(post) => (
        <BoardPostContainer
          extractor={props.extractor}
          post={post as UserBoardPost}
        />
      )}
    />
  );
};
