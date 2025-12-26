import { Link, useParams } from "wouter";
import { CategoryConfig, Extractor, Post, SubCategoryProps } from "~/types";
import { pageSchema } from "~/page-schema";
import { UserPost, ImagePost, SearchPost, SearchPostProps } from "../posts";
import { useQuery } from "@tanstack/react-query";
import { useLoadingBar } from "react-top-loading-bar";
import { UserPostProps } from "../posts/User";
import { ImagePostProps } from "../posts/Image";

export const PostPage = <T extends Post<T>>() => {
  const { url } = useParams();
  const {
    data: extractor,
    isPending,
    isFetched,
  } = useQuery<Extractor>({
    queryKey: [`/extractors?url=${encodeURIComponent(String(url))}`],
  });
  const { start, complete } = useLoadingBar({
    color: "var(--color-indigo-400)",
    height: 2,
  });

  if (isPending) {
    start();
  }

  if (isFetched) {
    complete();
  }

  if (extractor?.category && extractor.subcategory) {
    const { category, subcategory } = extractor;
    const schemaProps =
      pageSchema[category as keyof CategoryConfig]?.[
        subcategory as keyof SubCategoryProps<T>
      ];

    if (schemaProps) {
      switch (subcategory as keyof SubCategoryProps<T>) {
        case "search":
          return <SearchPost {...(schemaProps as SearchPostProps<T>)} />;
        case "user":
        case "board":
        case "created":
        case "creator":
          return <UserPost {...(schemaProps as UserPostProps<T>)} />;
        case "photo":
        case "post":
        case "image":
        case "pin": {
          return <ImagePost {...(schemaProps as ImagePostProps<T>)} />;
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
