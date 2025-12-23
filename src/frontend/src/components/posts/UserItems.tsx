import { ItemsExtractor, PostResponse, UserItem } from "~/types";
import { LoadingContainer } from "../LoadingContainer";
import { useFetchOnScroll } from "~/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cloneElement, ReactElement, ReactNode, Ref } from "react";
import { NoDataContainer } from "../NoDataContainer";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

interface ItemsContainer {
  hasNextPage: boolean;
  ref: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const ItemsContainer = ({
  hasNextPage,
  ref,
  children,
}: ItemsContainer) => {
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
};

interface UserItemsContainerProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: ItemsExtractor<T>;
  itemRenderer: (item: UserItem) => ReactElement;
}

export const UserItemsContainer = <T,>({
  data: initialData,
  url,
  extractor,
  itemRenderer,
}: UserItemsContainerProps<T>) => {
  const fetchPosts = async (page: number) => {
    if (url) {
      if (page === 0 && initialData) {
        return extractor.extractor(initialData as T);
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/posts/${encodeURIComponent(url)}/?limit=${ITEMS_PER_PAGE}&skip=${page * ITEMS_PER_PAGE}${extractor.batch ? "&batch=true" : ""}`,
      );
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`, {
          cause: resData.message,
        });
      }

      if (resData.urls.length === 0) {
        return Promise.resolve(null);
      }

      const extractedData = extractor.extractor(resData);
      if (!extractedData.length) {
        throw new Error("Extraction failed");
      }

      return Promise.resolve(extractedData);
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
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage?.length && lastPage?.length > 0
        ? lastPageParam + 1
        : undefined;
    },
  });

  const posts = data?.pages.flatMap((page) => page);

  const { ref } = useFetchOnScroll(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage && !isPending,
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

  return posts && posts?.length > 0 ? (
    <ItemsContainer
      ref={ref}
      hasNextPage={hasNextPage && !isFetchNextPageError}
    >
      {posts?.map(
        (post) => post && cloneElement(itemRenderer(post as UserItem)),
      )}
    </ItemsContainer>
  ) : (
    <NoDataContainer />
  );
};
