import { Link, useParams } from "wouter";
import {
  GalleryItem,
  BoardItem,
  ThreadPost,
  ThreadResponse,
  GroupBoardResponse,
  MediaBoardResponse,
  GalleryResponse,
  ImageResponse,
  UserInfoData,
  UserInfoResponse,
  UserProfileResponse,
  PageResponse,
} from "~/types";
import { useQuery } from "@tanstack/react-query";
import { useLoadingBar } from "react-top-loading-bar";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Heart,
  Play,
  MessageCircle,
  Share2,
  ArrowUp,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBookmarkStore } from "~/bookmarkStore";
import ShakaVideo from "shaka-video-element/react";
import {
  BottomSheet,
  Button,
  Stat,
  GroupBoardItemContainer,
  ImagePostContainer,
  MediaBoardItemContainer,
  ThreadPostContainer,
  ItemsContainer,
} from "~/components";
import { ErrorContainer, UserAvatar } from "~/components";
import { formatTimeAgo } from "~/utils";

const Gallery = ({
  url,
  initialData,
}: {
  url: string;
  initialData?: GalleryResponse;
}) => (
  <ItemsContainer<GalleryResponse, GalleryItem>
    url={url}
    initialData={initialData}
    itemRenderer={(item, i) => <ImagePostContainer key={i} post={item} />}
  />
);

const GroupBoard = ({
  url,
  initialData,
}: {
  url: string;
  initialData?: GroupBoardResponse;
}) => (
  <ItemsContainer<GroupBoardResponse, BoardItem>
    url={url}
    initialData={initialData}
    itemRenderer={(item, i) => <GroupBoardItemContainer key={i} post={item} />}
  />
);

const MediaBoard = ({
  url,
  initialData,
}: {
  url: string;
  initialData?: MediaBoardResponse;
}) => (
  <ItemsContainer<MediaBoardResponse, BoardItem>
    url={url}
    initialData={initialData}
    columns={
      initialData?.columns != null
        ? `grid-cols-${initialData.columns}`
        : "xs:grid-cols-2 lg:grid-cols-3"
    }
    containerClass={
      initialData?.columns === 1 ? "w-full max-w-2xl mx-auto" : undefined
    }
    itemRenderer={(item, i) => (
      <MediaBoardItemContainer
        key={i}
        post={item}
        separator={initialData?.columns === 1}
        extraClassName={
          initialData?.columns === 1 ? "!h-[500px] !min-h-[500px]" : ""
        }
      />
    )}
  />
);

const Thread = ({
  url,
  initialData,
}: {
  url: string;
  initialData?: ThreadResponse;
}) => (
  <ItemsContainer<ThreadResponse, ThreadPost>
    url={url}
    initialData={initialData}
    columns="grid-cols-1"
    itemRenderer={(item, i) => <ThreadPostContainer key={i} post={item} />}
  />
);

const UserInfoHeader = ({ data }: { data: UserInfoData }) => (
  <div className="flex flex-col border-b border-neutral-800">
    <div className="flex gap-x-4 py-6 px-6">
      <UserAvatar
        thumbnail={data.thumbnail}
        extraClassNames="border border-neutral-800 bg-neutral-800 h-24 w-24 sm:h-36 sm:w-36"
      />
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          {data.name && (
            <h1 className="text-xl xs:text-3xl font-bold">{data.name}</h1>
          )}
          {data.verified && (
            <CheckCircle fill="var(--color-indigo-400)" color="black" />
          )}
        </div>
        {data.stats && (
          <div className="flex gap-x-4 text-sm xs:text-base">
            {data.stats.following && (
              <div className="flex gap-x-1">
                <span className="font-semibold">{data.stats.following}</span>
                <span className="text-neutral-500">following</span>
              </div>
            )}
            {data.stats.followers && (
              <div className="flex gap-x-1">
                <span className="font-semibold">{data.stats.followers}</span>
                <span className="text-neutral-500">followers</span>
              </div>
            )}
            {data.stats.mediaCount && (
              <div className="hidden sm:flex gap-x-1">
                <span className="font-semibold">{data.stats.mediaCount}</span>
                <span className="text-neutral-500">posts</span>
              </div>
            )}
          </div>
        )}
        {data.category && (
          <span className="text-neutral-500 text-sm">{data.category}</span>
        )}
        {data.nickname && (
          <h2 className="text-neutral-300 font-semibold">{data.nickname}</h2>
        )}
        {data.bio && (
          <span className="whitespace-pre-line text-sm">{data.bio}</span>
        )}
      </div>
    </div>
    {data.private && (
      <div className="h-36 flex items-center justify-center w-full">
        <span className="text-neutral-200">This account is private</span>
      </div>
    )}
  </div>
);

const UserInfo = ({ data }: { data: UserInfoResponse }) => (
  <UserInfoHeader data={data} />
);

const UserInfoUrl = ({ url }: { url: string }) => {
  const { data, error } = useQuery<UserInfoResponse>({
    queryKey: [`/posts/${encodeURIComponent(url)}`],
    staleTime: Infinity,
    gcTime: Infinity,
  });
  if (error) return <ErrorContainer error={error as Error} />;
  return data ? <UserInfoHeader data={data} /> : null;
};

const UserProfile = ({ data }: { data: UserProfileResponse }) => (
  <div className="flex flex-col flex-auto">
    {data.avatarUrl && <UserInfoUrl url={data.avatarUrl} />}
    {data.galleryUrl && <Gallery url={data.galleryUrl} />}
  </div>
);

const ImageView = ({
  data,
  pageUrl,
}: {
  data: ImageResponse;
  pageUrl: string;
}) => {
  const { add, remove, isBookmarked } = useBookmarkStore();
  const bookmarked = isBookmarked(pageUrl);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const descRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) setDescOverflows(el.scrollHeight > el.clientHeight);
  }, [data.description]);
  const thumbnail =
    data.posterUrl ?? (data.type !== "video" ? data.url : undefined);
  const toggleBookmark = () => {
    if (bookmarked) {
      remove(pageUrl);
    } else {
      add({ url: pageUrl, thumbnail });
    }
  };
  const hasAspect = !!(data.width && data.height);
  return (
    <div className="flex flex-col items-center justify-center flex-auto bg-black text-white box-border lg:p-8">
      <div
        className={`w-full lg:border lg:overflow-hidden border-neutral-800 ${hasAspect ? "lg:w-fit lg:max-w-[80%]" : "flex-auto lg:h-[550px] lg:w-4/5"}`}
      >
        <div
          className={`h-[calc(100dvh-60px)] flex flex-col md:flex-row ${hasAspect ? "lg:h-auto" : "lg:h-full flex-auto"}`}
        >
          <div
            className={
              hasAspect
                ? "flex-1 md:flex-none overflow-hidden md:max-h-[calc(100dvh-60px)] lg:max-h-[calc(100dvh-60px-4rem-2px)]"
                : "h-0 md:h-full w-full flex-auto"
            }
            style={
              hasAspect
                ? { aspectRatio: `${data.width}/${data.height}` }
                : undefined
            }
          >
            {data.type === "video" ? (
              <ShakaVideo
                className="min-w-full max-w-full min-h-full max-h-full object-contain h-dvh"
                src={data.videoUrl}
                poster={data.posterUrl}
                controls
              />
            ) : data.url ? (
              <img
                src={data.url}
                width={data.width}
                height={data.height}
                className="object-contain min-w-full max-w-full min-h-full max-h-full"
              />
            ) : null}
          </div>
          <div
            className={`md:border-l border-neutral-800 md:p-0 flex flex-col gap-y-2 py-4 p-2 ${hasAspect ? "md:flex-1 lg:flex-initial lg:w-[400px] lg:max-h-[calc(100dvh-60px-4rem-2px)]" : "md:w-[380px] md:shrink-0"}`}
          >
            <div className="md:border-b border-neutral-800 md:p-4 flex gap-x-2 gap-y-4 items-center px-2 justify-between md:justify-normal md:flex-wrap text-sm">
              <div className="flex items-center gap-x-2">
                {data.authorThumbnail && (
                  <UserAvatar
                    thumbnail={data.authorThumbnail}
                    extraClassNames="h-10 w-10 border border-neutral-800"
                  />
                )}
                {data.authorUrl ? (
                  <Link
                    href={`/post/${encodeURIComponent(data.authorUrl)}`}
                    className="font-semibold"
                  >
                    {data.authorName}
                  </Link>
                ) : (
                  <span className="font-semibold">{data.authorName}</span>
                )}
              </div>
              {data.groupName && (
                <div className="flex gap-x-2 items-center">
                  In
                  <Link
                    className="flex gap-x-2 text-neutral-100 font-medium items-center"
                    href={
                      data.groupUrl
                        ? `/post/${encodeURIComponent(data.groupUrl)}`
                        : ""
                    }
                  >
                    <UserAvatar
                      extraClassNames="h-6 w-6"
                      thumbnail={data.groupThumbnail}
                    />
                    <span className="line-clamp-1">{data.groupName}</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-auto overflow-y-auto overflow-x-hidden min-h-0">
              {data.description && (
                <>
                  <div
                    className={`px-2 lg:px-4 py-2 flex flex-col gap-y-1 ${descOverflows ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (!descOverflows) return;
                      if (window.innerWidth < 768) setSheetOpen(true);
                      else setDescExpanded((v) => !v);
                    }}
                  >
                    <span
                      ref={descRef}
                      className={`text-sm/6 text-neutral-200 [overflow-wrap:anywhere] ${descExpanded ? "" : "line-clamp-2"}`}
                      dangerouslySetInnerHTML={{ __html: data.description }}
                    />
                    {descOverflows && (
                      <span className="text-xs text-neutral-500">
                        {descExpanded ? "less" : "more"}
                      </span>
                    )}
                  </div>
                  <BottomSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                  >
                    <span
                      className="text-sm/6 text-neutral-200 [overflow-wrap:anywhere]"
                      dangerouslySetInnerHTML={{ __html: data.description }}
                    />
                  </BottomSheet>
                </>
              )}
            </div>
            <div className="shrink-0 md:border-t border-neutral-800 md:p-4 px-2 py-3 flex flex-col gap-y-2">
              <div className="flex items-center gap-x-3 flex-wrap w-full">
                {data.stats?.likes != null && (
                  <Stat icon={<Heart />} value={data.stats.likes} />
                )}
                {data.stats?.plays != null && (
                  <Stat icon={<Play />} value={data.stats.plays} />
                )}
                {data.stats?.comments != null && (
                  <Stat icon={<MessageCircle />} value={data.stats.comments} />
                )}
                {data.stats?.shares != null && (
                  <Stat icon={<Share2 />} value={data.stats.shares} />
                )}
                {data.stats?.score != null && (
                  <Stat icon={<ArrowUp />} value={data.stats.score} />
                )}
                {data.stats?.saves != null && (
                  <Stat icon={<Star />} value={data.stats.saves} />
                )}
                <Button
                  size="sm"
                  icon={bookmarked ? <BookmarkCheck /> : <Bookmark />}
                  onClick={toggleBookmark}
                  extraClassName={`ml-auto ${bookmarked ? "" : "text-neutral-400 hover:text-white"}`}
                >
                  {bookmarked ? "Saved" : "Save"}
                </Button>
              </div>
              {data.date && (
                <span
                  className="text-xs text-neutral-400"
                  title={new Date(data.date).toLocaleString()}
                >
                  {formatTimeAgo(new Date(data.date))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostPage = () => {
  const { url } = useParams();

  const {
    data: page,
    error: postError,
    isPending,
    isFetched,
  } = useQuery<PageResponse>({
    queryKey: [`/posts/${encodeURIComponent(String(url))}`],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { start, complete } = useLoadingBar({
    color: "var(--color-indigo-400)",
    height: 2,
  });

  const barStarted = useRef(false);

  useEffect(() => {
    if (isPending) {
      start();
      barStarted.current = true;
    } else if (isFetched && barStarted.current) {
      complete();
      barStarted.current = false;
    }
  }, [isPending, isFetched]);

  if (postError) return <ErrorContainer error={postError as Error} />;

  switch (page?.renderer) {
    case "gallery":
      return (
        <Gallery url={String(url)} initialData={page as GalleryResponse} />
      );
    case "image":
      return <ImageView data={page as ImageResponse} pageUrl={String(url)} />;
    case "group-board":
      return (
        <GroupBoard
          url={String(url)}
          initialData={page as GroupBoardResponse}
        />
      );
    case "media-board":
      return (
        <MediaBoard
          url={String(url)}
          initialData={page as MediaBoardResponse}
        />
      );
    case "thread":
      return <Thread url={String(url)} initialData={page as ThreadResponse} />;
    case "user-info":
      return <UserInfo data={page as UserInfoResponse} />;
    case "user-profile":
      return <UserProfile data={page as UserProfileResponse} />;
  }

  if (isFetched && url) {
    return (
      <div className="flex-auto flex items-center justify-center p-6">
        <span className="[overflow-wrap:anywhere] font-semibold text-lg text-center">
          No page available for{" "}
          <Link
            href={decodeURIComponent(url)}
            className="text-indigo-400 underline"
          >
            {decodeURIComponent(url)}
          </Link>
        </span>
      </div>
    );
  }
};
