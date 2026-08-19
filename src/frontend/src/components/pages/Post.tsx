import { Link, useParams } from "wouter";
import { CategoryConfig, Extractor, Post, SubCategoryProps } from "~/types";
import { hash } from "~/utils";
import { pageSchema } from "~/page-schema";
import { UserPost, ImagePost, SearchPost, SearchPostProps } from "../posts";
import { useQuery } from "@tanstack/react-query";
import { useLoadingBar } from "react-top-loading-bar";
import { UserPostProps } from "../posts/User";
import { ImagePostProps } from "../posts/Image";
import { useEffect, useRef } from "react";

export const PostPage = <T extends Post<T>>() => {
  const { url } = useParams();
  const {
    data: extractor,
    isPending,
    isFetched,
  } = useQuery<Extractor>({
    queryKey: [`/extractors?url=${encodeURIComponent(String(url))}`],
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

  if (extractor?.category && extractor.subcategory) {
    const { category, subcategory } = extractor;
    const schemaProps =
      (pageSchema as CategoryConfig)[hash(category)]?.[hash(category + subcategory)];
    const baseUrl = url
      ? new URL(decodeURIComponent(String(url))).origin
      : undefined;

    if (schemaProps) {
      switch (subcategory as keyof SubCategoryProps<T>) {
        case "search":
          return <SearchPost {...(schemaProps as SearchPostProps<T>)} baseUrl={baseUrl} />;
        case "user":
        case "board":
        case "created":
        case "creator":
        case "trending":
        case "mostliked":
          return (
            <UserPost
              {...(schemaProps as UserPostProps<T>)}
              baseUrl={baseUrl}
            />
          );
        case "photo":
        case "post":
        case "image":
        case "pin": {
          return (
            <ImagePost
              {...(schemaProps as ImagePostProps<T>)}
              baseUrl={baseUrl}
            />
          );
        }
      }
    }
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
