import { ItemsExtractor, PostResponse, UserItem } from "~/types";
import { LoadingContainer, NoDataContainer } from "../layout";
import { useFetchOnScroll } from "~/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cloneElement, forwardRef, ReactElement, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { URLExtractor, URLUserExtractor } from "./User";

const ITEMS_PER_PAGE = 10;

interface ItemsPaginationContainerProps {
  hasNextPage?: boolean;
  children?: ReactNode;
}

export const ItemsPaginationContainer = forwardRef<
  HTMLDivElement,
  ItemsPaginationContainerProps
>(({ hasNextPage, children }, ref) => {
  return (
    <div className="flex flex-col w-full p-4">
      <div className="grid w-full xs:grid-cols-3 lg:grid-cols-5 gap-4">
        {children}
      </div>
      {hasNextPage && (
        <div ref={ref} className="p-4 flex w-full justify-center">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
      )}
    </div>
  );
});

interface ItemsContainerProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractors: ItemsExtractor<T>[];
  itemsContainerComponent: ReactElement;
  itemRenderer: (item: UserItem | URLUserExtractor<T>) => React.ReactElement;
}

export const ItemsContainer = <T,>({
  data: initialData,
  url,
  extractors,
  itemsContainerComponent,
  itemRenderer,
}: ItemsContainerProps<T>) => {
  const fetchPosts = async (page: number) => {
    if (url) {
      if (page === 0 && initialData) {
        return initialData as T;
      }
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

  const {
    data,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    isFetchNextPageError,
    error,
  } = useInfiniteQuery({
    queryKey: [`/posts/${url}`],
    queryFn: ({ pageParam }) => {
      return fetchPosts(pageParam);
    },
    gcTime: Infinity,
    staleTime: Infinity,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage?.urls.length && lastPage?.urls.length > 0
        ? lastPageParam + 1
        : undefined;
    },
  });

  const urls = data?.pages.flatMap((page) => page.urls);
  const urlExtractors: URLUserExtractor<T>[] | undefined = urls
    ?.reduce(
      (acc: URLExtractor<T>, curr: string) => {
        const matchExt = acc.extractors?.find((ext) =>
          ext.urlMatcher?.test(curr),
        );

        if (matchExt) {
          if (
            acc.urls?.some(
              (ext) =>
                ext.extractor.unique &&
                ext.extractor.urlMatcher == matchExt.urlMatcher &&
                ext.extractor.type &&
                matchExt.type,
            )
          ) {
            return {
              ...acc,
              extractors: acc.extractors.filter(
                (ext) => ext.type !== matchExt.type,
              ),
            };
          }

          return {
            extractors: acc.extractors,
            urls: [
              ...acc.urls,
              { url: matchExt.originalUrl ? url : curr, extractor: matchExt },
            ],
          } as URLExtractor<T>;
        }
        return acc;
      },
      { extractors: extractors, urls: [] },
    )
    .urls.sort(
      (a: URLUserExtractor<T>, b: URLUserExtractor<T>) =>
        extractors.findIndex((ext) => ext.type === a.extractor.type) -
        extractors.findIndex((ext) => ext.type === b.extractor.type),
    );

  const { ref } = useFetchOnScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage && !isPending && !isFetchNextPageError,
  );

  if (isPending) {
    return <LoadingContainer />;
  }

  if (isError) {
    toast.error(error.message, {
      description: error.cause ? String(error.cause) : undefined,
      className: "!bg-red-900",
    });
  }
  const pages = data?.pages.flatMap((page) => page);
  const posts =
    urlExtractors && urlExtractors?.length > 0
      ? urlExtractors
      : pages?.flatMap((page) => extractors[0].extractor(page));

  return posts && posts?.length > 0 ? (
    cloneElement(itemsContainerComponent, {
      ref,
      hasNextPage: hasNextPage && !isFetchNextPageError,
      children: posts?.map(
        (post) =>
          post &&
          cloneElement(itemRenderer(post as UserItem | URLUserExtractor<T>)),
      ),
    } as ItemsPaginationContainerProps)
  ) : (
    <NoDataContainer />
  );
};
