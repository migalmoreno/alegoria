import { Link } from "wouter";
import { UserExtractor, UserPost } from "../../types";

interface PostContainerProps<T> {
  post?: UserPost;
  extractor: UserExtractor<T>;
  extraClassName?: string;
}

export const PostContainer = <T,>({
  post,
  extraClassName,
}: PostContainerProps<T>) => {
  return (
    <div
      className={`min-h-[500px] h-[500px] xs:min-h-[300px] xs:h-[300px] lg:h-[500px] rounded-lg overflow-hidden bg-neutral-800 w-full ${extraClassName}`}
    >
      <Link
        className="outline-none"
        href={`/post/${encodeURIComponent(String(post?.url))}`}
      >
        <img
          alt=""
          className="object-cover min-h-full max-h-full w-full border-black border"
          src={
            post?.thumbnail &&
            `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(post?.thumbnail)}`
          }
        />
      </Link>
    </div>
  );
};
