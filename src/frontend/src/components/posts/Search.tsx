import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { GalleryExtractor, PostResponse, SearchExtractor } from "~/types";
import { ErrorContainer } from "../layout";
import { Gallery } from "./Gallery";
import { useEffect } from "react";
import { useAppStore } from "~/store";
import { useBreakpoint } from "~/hooks";

export interface SearchPostProps<T> {
  extractors: SearchExtractor<T>[];
}

export const SearchPost = <T,>({ extractors }: SearchPostProps<T>) => {
  const { url } = useParams();
  const { data, isError, error } = useQuery<PostResponse<T>>({
    queryKey: [`/posts/${encodeURIComponent(String(url))}`],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const dispatch = useAppStore((state) => state.dispatch);
  const breakpoint = useBreakpoint();

  useEffect(() => {
    dispatch({ type: "showSearchForm", show: breakpoint === "sm" });
    return () => {
      dispatch({ type: "showSearchForm", show: false });
    };
  }, [breakpoint]);

  if (isError) {
    return <ErrorContainer error={error} />;
  }

  const dataExtractors = extractors.filter((ext) => !!!ext.urlMatcher);

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {dataExtractors &&
        data &&
        dataExtractors?.length > 0 &&
        dataExtractors.map((ext, i) => {
          switch (ext.type) {
            case "gallery":
              return (
                <Gallery
                  key={i}
                  data={data}
                  url={String(url)}
                  extractor={ext as GalleryExtractor<T>}
                />
              );
          }
        })}
    </div>
  );
};
