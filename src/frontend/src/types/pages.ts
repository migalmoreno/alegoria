import { UserPostProps } from "../components/posts/User";
import { ImagePostProps } from "~/components/posts/Image";
import { SearchPostProps } from "~/components/posts";

export type Post<
  T extends {
    user?: T["user"];
    creator?: T["creator"];
    image?: T["image"];
    post?: T["post"];
    photo?: T["photo"];
    board?: T["board"];
    pin?: T["pin"];
    created?: T["created"];
    search?: T["search"];
    trending?: T["trending"];
    mostliked?: T["mostliked"];
  },
> = {
  user?: T["user"];
  creator?: T["creator"];
  image?: T["image"];
  post?: T["post"];
  photo?: T["photo"];
  board?: T["board"];
  pin?: T["pin"];
  created?: T["created"];
  search?: T["search"];
  trending?: T["trending"];
  mostliked?: T["mostliked"];
};

export interface SubCategoryProps<T extends Post<T>> {
  user?: UserPostProps<T["user"]>;
  creator?: UserPostProps<T["creator"]>;
  image?: ImagePostProps<T["image"]>;
  post?: ImagePostProps<T["post"]>;
  photo?: ImagePostProps<T["photo"]>;
  board?: UserPostProps<T["board"]>;
  pin?: ImagePostProps<T["pin"]>;
  created?: UserPostProps<T["board"]>;
  search?: SearchPostProps<T["search"]>;
  trending?: UserPostProps<T["trending"]>;
  mostliked?: UserPostProps<T["mostliked"]>;
}

export type CategoryConfig = Record<string, Record<string, any>>;
