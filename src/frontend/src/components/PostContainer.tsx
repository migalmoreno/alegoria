import { useState } from "react";
import { Link } from "wouter";
import { GalleryItem, BoardItem, ThreadPost } from "~/types";
import { formatTimeAgo } from "~/utils";
import { Bullet } from "./Bullet";
import { UserAvatar } from "./UserAvatar";
import { MessageSquare, ArrowUp, ExternalLink } from "lucide-react";

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
          {(post?.count ?? 0) > 0 && <span>{post!.count} items</span>}
          {(post?.count ?? 0) > 0 && post?.date && <Bullet />}
          {post?.date && <span>{formatTimeAgo(new Date(post.date))}</span>}
        </div>
      </div>
    </div>
  );
};

interface ThreadPostContainerProps {
  post?: ThreadPost;
}

export const ThreadPostContainer = ({ post }: ThreadPostContainerProps) => {
  const [mediaOpen, setMediaOpen] = useState(false);
  const proxyUrl = (u: string) =>
    `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(u)}`;
  const isVideo =
    post?.mediaType === "video" ||
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(post?.url ?? "");

  return (
    <div
      id={post?.no != null ? `p${post.no}` : undefined}
      className="flex flex-col gap-y-2 border border-neutral-800 rounded-xl p-3"
    >
      <div className="flex items-center gap-x-2 text-xs text-neutral-400">
        {post?.authorUrl ? (
          <Link
            href={`/post/${encodeURIComponent(post.authorUrl)}`}
            className="font-semibold text-neutral-200"
          >
            {post.name ?? "Anonymous"}
          </Link>
        ) : (
          <span className="font-semibold text-neutral-200">
            {post?.name ?? "Anonymous"}
          </span>
        )}
        {post?.groupName && (
          <Link
            href={`/post/${encodeURIComponent(post.groupUrl ?? post.groupName)}`}
            className="text-neutral-400 hover:text-neutral-200"
          >
            {post.groupName}
          </Link>
        )}
        {post?.no != null && <span>#{post.no}</span>}
        {post?.date && (
          <span title={new Date(post.date).toLocaleString()}>
            {formatTimeAgo(new Date(post.date))}
          </span>
        )}
        {(post?.score ?? 0) > 0 && (
          <span className="flex items-center gap-x-1">
            <ArrowUp size={12} />
            {post!.score}
          </span>
        )}
        {(post?.count ?? 0) > 0 && (
          <span className="flex items-center gap-x-1">
            <MessageSquare size={12} />
            {post!.count}
          </span>
        )}
        {post?.sourceUrl && (
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 p-1 -m-1"
          >
            <ExternalLink size={12} />
          </a>
        )}
        {post?.postUrl && (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto shrink-0 p-1 -m-1"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      {post?.thumbnail &&
        (post?.url ? (
          <>
            {mediaOpen ? (
              isVideo ? (
                <video
                  src={proxyUrl(post.url)}
                  className="max-w-xs rounded-lg"
                  controls
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  alt=""
                  className="max-w-xs object-contain rounded-lg"
                  src={proxyUrl(post.url)}
                />
              )
            ) : (
              <img
                alt=""
                className="max-h-64 max-w-xs object-contain rounded-lg cursor-pointer"
                src={proxyUrl(post.thumbnail)}
                onClick={() => setMediaOpen(true)}
              />
            )}
          </>
        ) : (
          <img
            alt=""
            className="max-h-64 max-w-xs object-contain rounded-lg"
            src={proxyUrl(post.thumbnail)}
          />
        ))}
      {post?.com && (
        <div
          className="text-sm text-neutral-200 [overflow-wrap:anywhere]"
          dangerouslySetInnerHTML={{ __html: post.com }}
        />
      )}
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
    <div className="flex flex-col gap-y-2 min-w-0 border-b xs:border-b-0 border-neutral-800 pb-2 xs:pb-0">
      <Link
        className="outline-none"
        href={`/post/${encodeURIComponent(String(post?.url))}`}
      >
        <h1 className="font-semibold text-sm line-clamp-2 break-words">
          {post?.name}
        </h1>
      </Link>
      {post?.thumbnail && (
        <div
          className={`min-h-[250px] h-[250px] rounded-2xl overflow-hidden bg-neutral-800 w-full ${extraClassName ?? ""}`}
        >
          <Link
            className="outline-none"
            href={`/post/${encodeURIComponent(String(post?.url))}`}
          >
            <img
              alt=""
              className="object-cover min-h-full max-h-full w-full border-black border"
              src={`${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(post.thumbnail)}`}
            />
          </Link>
        </div>
      )}
      {post?.description && (
        <p
          className={`text-neutral-400 text-xs break-words ${post.thumbnail ? "line-clamp-2" : ""}`}
        >
          {post.description}
        </p>
      )}
      <div className="flex text-neutral-400 text-xs items-center gap-x-1.5">
        {(post?.count ?? 0) > 0 && (
          <span className="flex items-center gap-x-1">
            <MessageSquare size={12} />
            {post!.count}
          </span>
        )}
        {(post?.score ?? 0) > 0 && (
          <>
            {(post?.count ?? 0) > 0 && <Bullet />}
            <span className="flex items-center gap-x-1">
              <ArrowUp size={12} />
              {post!.score}
            </span>
          </>
        )}
        {((post?.count ?? 0) > 0 || (post?.score ?? 0) > 0) && post?.date && (
          <Bullet />
        )}
        {post?.date && <span>{formatTimeAgo(new Date(post.date))}</span>}
      </div>
    </div>
  );
};
