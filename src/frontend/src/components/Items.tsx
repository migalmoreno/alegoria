import { forwardRef, ReactNode, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFetchOnScroll } from "~/hooks";
import { ErrorContainer } from "./ErrorContainer";
import { LoadingContainer } from "./LoadingContainer";
import { NoDataContainer } from "./NoDataContainer";

const ITEMS_PER_PAGE = 10;

interface ItemsPaginationContainerProps {
  hasNextPage?: boolean;
  error?: Error | null;
  children?: ReactNode;
  columns?: string;
}

export const ItemsPaginationContainer = forwardRef<
  HTMLDivElement,
  ItemsPaginationContainerProps
>(({ hasNextPage, error, children, columns }, ref) => {
  useEffect(() => {
    if (error)
      toast.error("Failed to load more", { description: error.message });
  }, [error]);
  return (
    <div className="flex flex-col w-full p-4">
      <div
        className={`grid w-full ${columns ?? "xs:grid-cols-3 lg:grid-cols-5"} gap-4`}
      >
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

interface ItemsContainerProps<T extends { items: I[] }, I> {
  url: string;
  initialData?: T;
  itemRenderer: (item: I, index: number) => ReactNode;
  columns?: string;
}

export const ItemsContainer = <T extends { items: I[] }, I>({
  url,
  initialData,
  itemRenderer,
  columns,
}: ItemsContainerProps<T, I>) => {
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
      return json as T;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.items.length > 0 ? lastPageParam + 1 : undefined,
  });

  const items = data?.pages.flatMap((page) => page.items ?? []);
  const { ref } = useFetchOnScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage && !error,
  );

  if (isPending) return <LoadingContainer />;
  if (error && !items?.length) return <ErrorContainer error={error as Error} />;
  if (!items?.length) return <NoDataContainer />;

  return (
    <ItemsPaginationContainer
      hasNextPage={hasNextPage}
      error={error as Error}
      columns={columns}
      ref={ref}
    >
      {items?.map((item, i) => itemRenderer(item, i))}
    </ItemsPaginationContainer>
  );
};
