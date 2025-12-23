import { InstagramPost } from "./instagram";
import { PostResponse } from "./post";
import { TikTokMetadataItem, TikTokPostItem } from "./tiktok";
import { VscoGalleryItem, VscoGalleryPost } from "./vsco";
import { UserPostProps } from "../components/posts/User";
import { FacebookPhoto } from "./facebook";
import { ImagePostProps } from "~/components/posts/Image";
import { DirectLinkItem } from "./directlink";
import { PatreonItem } from "./patreon";
import { PinterestBoardItem, PinterestImageItem } from "./pinterest";

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
}

interface VscoCategory {
  user: PostResponse<VscoGalleryItem, VscoGalleryPost>;
  image: PostResponse<VscoGalleryItem, VscoGalleryPost, DirectLinkItem>;
}

interface FacebookCategory {
  user: PostResponse<FacebookPhoto>;
  photo: PostResponse<FacebookPhoto>;
}

interface InstagramCategory {
  user: PostResponse<InstagramPost>;
}

interface TikTokCategory {
  user: PostResponse<TikTokMetadataItem, TikTokPostItem>;
  post: PostResponse<TikTokMetadataItem, TikTokPostItem>;
}

interface PatreonCategory {
  creator: PostResponse<PatreonItem>;
  post: PostResponse<PatreonItem>;
}

interface PinterestCategory {
  user: PostResponse<PinterestBoardItem>;
  board: PostResponse<PinterestImageItem>;
  pin: PostResponse<PinterestImageItem>;
  created: PostResponse<PinterestBoardItem>;
}

export interface CategoryConfig {
  facebook: SubCategoryProps<FacebookCategory>;
  vsco: SubCategoryProps<VscoCategory>;
  instagram: SubCategoryProps<InstagramCategory>;
  tiktok: SubCategoryProps<TikTokCategory>;
  patreon: SubCategoryProps<PatreonCategory>;
  pinterest: SubCategoryProps<PinterestCategory>;
}
