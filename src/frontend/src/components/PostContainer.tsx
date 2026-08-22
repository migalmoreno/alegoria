import { Link } from "wouter";
import { GalleryItem, BoardItem } from "~/types";
import { formatTimeAgo } from "~/utils";
import { Bullet } from "./Bullet";
import { UserAvatar } from "./UserAvatar";

interface ImagePostContainerProps {
  post?: GalleryItem;
  extraClassName?: string;
}

export const ImagePostContainer = ({
  post,
  extraClassName,
}: ImagePostContainerProps) => {
  const metadata = post?.authorName && post.groupName;
  return (
    <div
      className={`min-h-[500px] h-[500px] xs:min-h-[300px] xs:h-[300px] lg:h-[500px] relative rounded-xl overflow-hidden bg-neutral-800 w-full ${extraClassName} ${metadata ? "before:content-[''] before:absolute before:bg-linear-to-b before:from-transparent before:to-black/80 before:z-0 before:from-50% before:top-0 before:bottom-0 before:right-0 before:left-0 before:z-0 before:pointer-events-none" : ""} `}
    >
      <Link
        className="outline-none z-10"
        href={`/post/${encodeURIComponent(String(post?.url))}`}
      >
        <img
          alt=""
          className="object-cover min-h-full max-h-full w-full border-black border z-10"
          src={
            post?.thumbnail &&
            `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(post?.thumbnail)}`
          }
        />
      </Link>
      {metadata && (
        <div className="absolute bottom-0 w-full p-2 flex items-end">
          <div className="relative flex flex-col gap-y-2 text-sm justify-end w-full">
            {post?.authorName && (
              <Link
                className="flex gap-x-2"
                href={
                  post?.authorUrl
                    ? `/post/${encodeURIComponent(post?.authorUrl)}`
                    : ""
                }
                title={post?.authorName}
              >
                <UserAvatar
                  extraClassNames="h-6 w-6"
                  thumbnail={post?.authorThumbnail}
                />
                <span className="line-clamp-1">{post?.authorName}</span>
              </Link>
            )}
            {post?.groupName && (
              <div className="flex gap-x-2 items-center">
                In
                <Link
                  className="flex gap-x-2 text-neutral-100 font-medium items-center"
                  href={
                    post?.groupUrl
                      ? `/post/${encodeURIComponent(post?.groupUrl)}`
                      : ""
                  }
                  title={post?.groupName}
                >
                  <UserAvatar
                    extraClassNames="h-6 w-6"
                    thumbnail={post?.groupThumbnail}
                  />
                  <span className="line-clamp-1">{post?.groupName}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface GroupBoardItemContainerProps {
  post?: BoardItem;
  extraClassName?: string;
}

export const GroupBoardItemContainer = ({
  post,
  extraClassName,
}: GroupBoardItemContainerProps) => {
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
          {post?.date && <span>{formatTimeAgo(new Date(post.date))}</span>}
        </div>
      </div>
    </div>
  );
};

interface MediaBoardItemContainerProps {
  post?: BoardItem;
  extraClassName?: string;
}

export const MediaBoardItemContainer = ({
  post,
  extraClassName,
}: MediaBoardItemContainerProps) => {
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
          {post?.date && <span>{formatTimeAgo(new Date(post.date))}</span>}
        </div>
      </div>
    </div>
  );
};
