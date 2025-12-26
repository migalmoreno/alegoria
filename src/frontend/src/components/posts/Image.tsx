import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Image, PostResponse, Video, YtdlItem } from "../../types";
import { formatTimeAgo } from "../../utils";
import { UserAvatar, ErrorContainer } from "../layout";
import ShakaVideo from "shaka-video-element/react";
import { useEffect, useRef } from "react";
import CustomVideoElement from "shaka-video-element";

export interface ImagePostProps<T> {
  extractor: (data: T) => Image;
  videoExtractor?: (data: PostResponse<YtdlItem>) => Video;
}

export const ImagePost = <T,>({
  extractor,
  videoExtractor,
}: ImagePostProps<T>) => {
  const { url } = useParams();
  const { data, error, isFetched, isPending, isError } = useQuery({
    queryKey: [`/posts/${url}`],
    select: (res: T) => extractor(res),
  });

  const videoRef = useRef<CustomVideoElement>(null);

  const { data: video } = useQuery<PostResponse<YtdlItem>>({
    enabled: !!data?.videoUrl,
    queryKey: [`/posts/${encodeURIComponent(String(data?.videoUrl))}`],
  });

  useEffect(() => {
    if (videoRef.current && videoExtractor && video) {
      const videoData = videoExtractor(video);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const player = videoRef.current.api;
      if (player) {
        player.configure({
          preferredVideoCodecs: ["av01", "vp9", "avc1"],
          preferredAudioCodecs: ["opus", "mp4a"],
          manifest: { disableVideo: false },
          streaming: {
            retryParameters: {
              maxAttempts: Infinity,
              baseDelay: 250,
              backoffFactor: 1.5,
            },
          },
        });
      }
      videoRef.current.src = videoData.url;
    }
  }, [video]);

  if (isError) {
    return <ErrorContainer error={error} />;
  }

  if (isFetched && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center flex-auto bg-black text-white box-border lg:p-8">
        <div className="w-full lg:h-[550px] lg:w-4/5 lg:border border-neutral-800 flex-auto">
          <div className="h-[calc(100dvh-60px)] lg:h-full flex flex-auto flex-col md:flex-row">
            <div className="h-0 md:h-full w-full flex-auto">
              {data.type === "video" ? (
                <ShakaVideo
                  className="min-w-full max-w-full min-h-full max-h-full object-cover h-dvh"
                  ref={videoRef}
                  poster={`${data.url}`}
                  controls
                />
              ) : (
                <img
                  src={`${data.url}`}
                  className="object-cover min-w-full max-w-full min-h-full max-h-full"
                />
              )}
            </div>
            <div className="md:border-l border-neutral-800 md:w-[300px] md:shrink-0 md:p-0 flex flex-col gap-y-2 py-4 p-2">
              <div className="md:border-b border-neutral-800 md:p-4 flex gap-x-2 items-center px-2">
                {data.authorThumbnail && (
                  <UserAvatar
                    thumbnail={data.authorThumbnail}
                    extraClassNames="h-10 w-10"
                  />
                )}
                {data.authorUrl ? (
                  <Link
                    href={`/post/${encodeURIComponent(data.authorUrl)}`}
                    className="font-semibold text-sm"
                  >
                    {data.user}
                  </Link>
                ) : (
                  <span className="font-semibold text-sm">{data.user}</span>
                )}
                {data.date && (
                  <span
                    className="text-neutral-400 text-sm shrink-0"
                    title={data.date.toLocaleString()}
                  >
                    {formatTimeAgo(data.date)}
                  </span>
                )}
              </div>
              {data.description && (
                <span
                  className="px-2 lg:px-4 text-sm/6 text-neutral-200 [overflow-wrap:anywhere]"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                ></span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};
