import { Link, useParams } from "wouter";
import {
  GalleryItem,
  BoardItem,
  GroupBoardResponse,
  MediaBoardResponse,
  GalleryResponse,
  ImageResponse,
  UserInfoData,
  UserInfoResponse,
  UserProfileResponse,
  PageResponse,
} from "~/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLoadingBar } from "react-top-loading-bar";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import ShakaVideo from "shaka-video-element/react";
import {
  GroupBoardItemContainer,
  ImagePostContainer,
  MediaBoardItemContainer,
  ItemsPaginationContainer,
} from "~/components";
import { useFetchOnScroll } from "~/hooks";
import { ErrorContainer, LoadingContainer, UserAvatar } from "~/components";
import { formatTimeAgo } from "~/utils";

const ITEMS_PER_PAGE = 10;

const Gallery = ({
  url,
  initialData,
}: {
  url: string;
  initialData?: GalleryResponse;
}) => {
  const {
    data,
    error,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [`/posts/${url}/normalized`],
    queryFn: async ({ pageParam }) => {
      if (pageParam === 0 && initialData) return initialData;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/posts/${encodeURIComponent(url)}?limit=${ITEMS_PER_PAGE}&skip=${pageParam * ITEMS_PER_PAGE}`,
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(`${res.status}: ${res.statusText}`, {
          cause: json.message,
        });
      return json as GalleryResponse;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.items.length > 0 ? lastPageParam + 1 : undefined,
  });

  const { ref } = useFetchOnScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage,
  );
  const items = data?.pages.flatMap((page) => page.items ?? []);

  if (isPending) return <LoadingContainer />;
  if (error) return <ErrorContainer error={error as Error} />;

  return (
    <ItemsPaginationContainer hasNextPage={hasNextPage} ref={ref}>
      {items?.map((item, i) => (
        <ImagePostContainer key={i} post={item as GalleryItem} />
      ))}
    </ItemsPaginationContainer>
  );
};

const GroupBoard = ({ items }: { items: BoardItem[] }) => (
  <ItemsPaginationContainer>
    {items.map((item, i) => (
      <GroupBoardItemContainer key={i} post={item} />
    ))}
  </ItemsPaginationContainer>
);

const MediaBoard = ({ items }: { items: BoardItem[] }) => (
  <ItemsPaginationContainer>
    {items.map((item, i) => (
      <MediaBoardItemContainer key={i} post={item} />
    ))}
  </ItemsPaginationContainer>
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

const ImageView = ({ data }: { data: ImageResponse }) => (
  <div className="flex flex-col items-center justify-center flex-auto bg-black text-white box-border lg:p-8">
    <div className="w-full lg:h-[550px] lg:w-4/5 lg:border border-neutral-800 flex-auto">
      <div className="h-[calc(100dvh-60px)] lg:h-full flex flex-auto flex-col md:flex-row">
        <div className="h-0 md:h-full w-full flex-auto">
          {data.type === "video" ? (
            <ShakaVideo
              className="min-w-full max-w-full min-h-full max-h-full object-cover h-dvh"
              src={data.videoUrl}
              poster={data.posterUrl}
              controls
            />
          ) : (
            <img
              src={data.url}
              className="object-cover min-w-full max-w-full min-h-full max-h-full"
            />
          )}
        </div>
        <div className="md:border-l border-neutral-800 md:w-[300px] md:shrink-0 md:p-0 flex flex-col gap-y-2 py-4 p-2">
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
              {data.date && (
                <span
                  className="text-neutral-400 shrink-0"
                  title={new Date(data.date).toLocaleString()}
                >
                  {formatTimeAgo(new Date(data.date))}
                </span>
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
          {data.description && (
            <span
              className="px-2 lg:px-4 text-sm/6 text-neutral-200 [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

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
      return <ImageView data={page as ImageResponse} />;
    case "group-board":
      return <GroupBoard items={(page as GroupBoardResponse).items} />;
    case "media-board":
      return <MediaBoard items={(page as MediaBoardResponse).items} />;
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
