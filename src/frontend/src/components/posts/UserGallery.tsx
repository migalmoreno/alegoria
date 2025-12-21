import { LoaderCircle } from "lucide-react";
import { useFetchOnScroll } from "../../hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostResponse, GalleryExtractor } from "../../types";
import { ReactNode, Ref } from "react";
import { PostContainer } from "./PostContainer";
import { LoadingContainer } from "../LoadingContainer";
import { ErrorContainer } from "../ErrorContainer";

const ITEMS_PER_PAGE = 10;

export const UserPageGalleryContainer = ({
  hasNextPage,
  ref,
  children,
}: {
  hasNextPage: boolean;
  ref: Ref<HTMLDivElement>;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full px-4">
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

interface UserPageGalleryProps<T> {
  data?: PostResponse<T>;
  url: string;
  extractor: GalleryExtractor<T>;
}

export const UserPageGallery = <T,>({
  data: initialData,
  url,
  extractor,
}: UserPageGalleryProps<T>) => {
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
    return <ErrorContainer error={error} />;
  }

  return (
    posts?.length && (
      <UserPageGalleryContainer ref={ref} hasNextPage={hasNextPage}>
        {posts?.map(
          (post, i) =>
            post && <PostContainer key={i} extractor={extractor} post={post} />,
        )}
      </UserPageGalleryContainer>
    )
  );
};
