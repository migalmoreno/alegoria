import { PostResponse, UserExtractor } from "../../types";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserInfo } from "./UserInfo";
import { Gallery } from "./Gallery";
import { ErrorContainer } from "../layout";
import { MediaBoard, GroupBoard } from "./Board";
import { ItemsContainer, ItemsPaginationContainer } from "./Items";
import { DynamicImagePost } from "./PostContainer";

export interface URLUserExtractor<T> {
  url: string;
  extractor: UserExtractor<T>;
}

export interface URLExtractor<T> {
  extractors: UserExtractor<T>[];
  urls: URLUserExtractor<T>[];
}

export interface UserPostProps<T> {
  extractors: UserExtractor<T>[];
}

export const UserPost = <T,>({ extractors }: UserPostProps<T>) => {
  const { url } = useParams();
  const { data, isError, error } = useQuery<PostResponse<T>>({
    queryKey: [`/posts/${encodeURIComponent(String(url))}`],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (isError) {
    return <ErrorContainer error={error} />;
  }

  const urlExtractors: URLUserExtractor<T>[] | undefined = data?.urls
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

  const dataExtractors = extractors.filter((ext) => !!!ext.urlMatcher);
  const postExtractors = extractors.filter((ext) => ext.type === "post");

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {dataExtractors &&
        data &&
        dataExtractors?.length > 0 &&
        dataExtractors.map((ext, i) => {
          switch (ext.type) {
            case "group-board":
              return (
                <GroupBoard
                  key={i}
                  data={data}
                  url={String(url)}
                  extractor={ext}
                />
              );
            case "media-board":
              return (
                <MediaBoard
                  key={i}
                  data={data}
                  url={String(url)}
                  extractor={ext}
                />
              );
            case "gallery":
              return (
                <Gallery
                  key={i}
                  data={data}
                  url={String(url)}
                  extractor={ext}
                />
              );
          }
        })}
      {urlExtractors &&
        data &&
        urlExtractors?.length > 0 &&
        urlExtractors?.map((ext, i) => {
          switch (ext.extractor.type) {
            case "info":
              return (
                <UserInfo
                  key={i}
                  data={data}
                  url={ext.url}
                  extractor={ext.extractor}
                />
              );
            case "gallery":
              return (
                <Gallery key={i} url={ext.url} extractor={ext.extractor} />
              );
          }
        })}
      {postExtractors?.length > 0 && url && data && (
        <ItemsContainer
          url={url}
          extractors={postExtractors}
          itemsContainerComponent={<ItemsPaginationContainer />}
          itemRenderer={(post) => (
            <DynamicImagePost extractor={postExtractors[0]} url={post.url} />
          )}
        />
      )}
    </div>
  );
};
