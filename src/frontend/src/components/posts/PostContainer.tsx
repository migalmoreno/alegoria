import { Link } from "wouter";
import { UserExtractor, UserImagePost, UserBoardPost } from "../../types";
import { formatTimeAgo } from "~/utils";
import { Bullet } from "../Bullet";

interface ImagePostContainerProps<T> {
  post?: UserImagePost;
  extractor: UserExtractor<T>;
  extraClassName?: string;
}

export const ImagePostContainer = <T,>({
  post,
  extraClassName,
}: ImagePostContainerProps<T>) => {
  return (
    <div
      className={`min-h-[500px] h-[500px] xs:min-h-[300px] xs:h-[300px] lg:h-[500px] rounded-xl overflow-hidden bg-neutral-800 w-full ${extraClassName}`}
    >
      <Link
        className="outline-none"
        href={`/post/${encodeURIComponent(String(post?.url))}`}
      >
        <img
          alt=""
          className="object-cover min-h-full max-h-full w-full border-black border"
          src={
            post?.thumbnail &&
            `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(post?.thumbnail)}`
          }
        />
      </Link>
    </div>
  );
};

interface BoardPostContainerProps<T> {
  post?: UserBoardPost;
  extractor: UserExtractor<T>;
  extraClassName?: string;
}

export const BoardPostContainer = <T,>({
  post,
  extraClassName,
}: BoardPostContainerProps<T>) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div
        className={`min-h-[200px] h-[200px] xs:min-h-[150px] xs:h-[150px] rounded-2xl overflow-hidden bg-neutral-800 w-full ${extraClassName}`}
      >
        <Link
          className="outline-none"
          href={`/post/${encodeURIComponent(String(post?.url))}`}
        >
          <img
            alt=""
            className="object-cover min-h-full max-h-full w-full border-black border"
            src={
              post?.thumbnail &&
              `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(post?.thumbnail)}`
            }
          />
        </Link>
      </div>
      <div className="flex flex-col gap-y-1">
        <h1 className="font-semibold text-sm">{post?.name}</h1>
        <div className="flex text-neutral-400 text-xs items-center gap-x-1">
          {post?.count && post.count > 0 && <span>{post.count} items</span>}
          {post?.count && post.count > 0 && post?.date && <Bullet />}
          {post?.date && <span>{formatTimeAgo(post.date)}</span>}
        </div>
      </div>
    </div>
  );
};
