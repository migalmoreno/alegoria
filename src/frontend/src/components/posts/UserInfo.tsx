import { CheckCircle, LinkIcon } from "lucide-react";
import { InfoExtractor, PostResponse, UserInfo, UserStats } from "../../types";
import { formatNumber } from "../../utils";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "../UserAvatar";
import { ErrorContainer } from "../ErrorContainer";
import { LoadingContainer } from "../LoadingContainer";

interface StatsItemProps {
  label: string;
  count: number;
}

const StatsItem = ({ label, count }: StatsItemProps) => {
  return (
    <div className="flex gap-x-1">
      <span className="font-semibold">{String(formatNumber(count))}</span>
      <span className="text-neutral-500">{label}</span>
    </div>
  );
};

const Stats = ({ stats }: { stats?: UserStats }) => {
  return (
    stats && (
      <div className="flex gap-x-4">
        {stats.following && (
          <StatsItem label="following" count={stats.following} />
        )}
        {stats.followers && (
          <StatsItem label="followers" count={stats.followers} />
        )}
        <div className="hidden sm:flex gap-x-4">
          {stats.mediaCount && (
            <StatsItem label="posts" count={stats.mediaCount} />
          )}
          {stats.likeCount && (
            <StatsItem label="likes" count={stats.likeCount} />
          )}
        </div>
      </div>
    )
  );
};

const UserPageInfoContainer = ({ user }: { user: UserInfo }) => {
  return (
    <div className="flex flex-col border-b border-neutral-800">
      <div className="flex gap-x-4 py-6 px-6">
        {user?.thumbnail && (
          <UserAvatar
            thumbnail={user.thumbnail}
            extraClassNames="h-24 w-24 sm:h-36 sm:w-36"
          />
        )}
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            {user?.name && <h1 className="text-3xl font-bold">{user.name}</h1>}
            {user?.verified && (
              <CheckCircle fill="var(--color-indigo-400)" color="black" />
            )}
          </div>
          <div className="md:flex">
            <Stats stats={user.stats} />
          </div>
          {user?.category && (
            <span className="text-neutral-500 text-sm">{user.category}</span>
          )}
          {user?.nickname && (
            <h2 className="text-neutral-300 font-semibold">{user.nickname}</h2>
          )}
          {user?.bio && (
            <span className="whitespace-pre-line text-sm">{user.bio}</span>
          )}
          {user?.bioLink && (
            <a
              className="text-red-400 underline flex items-center gap-x-1 [overflow-wrap:anywhere]"
              href={user.bioLink}
              target="_blank"
            >
              <LinkIcon size={14} />
              {user.bioLink}
            </a>
          )}
        </div>
      </div>
      {user.private && (
        <div className="h-36 flex items-center justify-center w-full">
          <span className="text-neutral-200">This account is private</span>
        </div>
      )}
    </div>
  );
};

interface UserPageInfoProps<T> {
  data: PostResponse<T>;
  url: string;
  extractor: InfoExtractor<T>;
}

export const UserPageInfo = <T,>({ url, extractor }: UserPageInfoProps<T>) => {
  const {
    data: user,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: [`/posts/${encodeURIComponent(extractor.fetchUrl || url)}`],
    select: (user: T) => extractor.extractor(user),
  });

  if (isPending) {
    return <LoadingContainer />;
  }

  if (isError) {
    return <ErrorContainer error={error} />;
  }

  return user && <UserPageInfoContainer user={user} />;
};
