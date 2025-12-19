import { useFetchOnScroll } from "../../hooks";
import { URLExtractor } from "../posts/User";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PostExtractor, UserExtractor } from "../../types";
import { PostContainer } from "./PostContainer";
import { UserPageGalleryContainer } from "./UserGallery";

const ITEMS_PER_PAGE = 10;

interface UserPageStreamPostProps<T> {
  url: string;
  extractor: PostExtractor<T>;
}

export const UserPageStreamPost = <T,>({
  url,
  extractor,
}: UserPageStreamPostProps<T>) => {
  const { data, isSuccess } = useQuery({
    queryKey: [`/posts/${encodeURIComponent(url)}`],
    select: (data: T) => extractor.extractor(data),
  });

  return (
    <PostContainer
      post={data}
      extractor={extractor}
      extraClassName={
        isSuccess ? "" : "animate-[pulse_0.7s_ease-in-out_infinite]"
      }
    />
  );
};

export interface URLPostExtractor<T> {
  url: string;
  extractor: PostExtractor<T>;
}

interface UserPagePostsProps<T> {
  extractors: UserExtractor<T>[];
  url: string;
}

export const UserPagePosts = <T,>({
  extractors,
  url,
}: UserPagePostsProps<T>) => {
  const postExtractors = extractors.filter((ext) => ext.type === "post");

  const fetchPosts = async (page: number) => {
    if (url) {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/posts/${encodeURIComponent(url)}/?limit=${ITEMS_PER_PAGE}&skip=${page * ITEMS_PER_PAGE}`,
      );
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`, {
          cause: resData.message,
        });
      }
      return Promise.resolve(resData);
    }
  };

  const { data, hasNextPage, isPending, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["user", "posts", url],
      queryFn: ({ pageParam }) => {
        return fetchPosts(pageParam);
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _, lastPageParam) => {
        return lastPage?.metadata.length && lastPage?.metadata.length > 0
          ? lastPageParam + 1
          : undefined;
      },
    });

  const urls = data?.pages.flatMap((page) => page.urls);
  const posts: URLPostExtractor<T>[] = urls
    ?.reduce(
      (acc: URLExtractor<T>, curr: string) => {
        const matchExt = acc.extractors?.find((ext) =>
          ext.urlMatcher?.test(curr),
        );

        if (matchExt) {
          return {
            extractors: acc.extractors,
            urls: [
              ...acc.urls,
              { url: matchExt.originalUrl ? url : curr, extractor: matchExt },
            ],
          };
        }
        return acc;
      },
      { extractors: postExtractors, urls: [] },
    )
    .urls.sort(
      (a: URLPostExtractor<T>, b: URLPostExtractor<T>) =>
        extractors.findIndex((ext) => ext.type === a.extractor.type) -
        extractors.findIndex((ext) => ext.type === b.extractor.type),
    );

  const { ref } = useFetchOnScroll(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage && !isPending,
  );

  return (
    <UserPageGalleryContainer hasNextPage={hasNextPage} ref={ref}>
      {posts?.map((ext, i) => (
        <UserPageStreamPost key={i} url={ext.url} extractor={ext.extractor} />
      ))}
    </UserPageGalleryContainer>
  );
};
