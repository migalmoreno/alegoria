import { CategoryConfig } from "./types";

export const pageSchema: CategoryConfig = {
  pinterest: {
    user: {
      extractors: [
        {
          type: "board",
          extractor: (data) =>
            data.metadata.map((post) => ({
              name: post.name,
              thumbnail: post.image_cover_url,
              url: `https://pinterest.com${encodeURIComponent(post.url)}`,
              count: post.pin_count,
              date: new Date(post.created_at),
            })),
        },
      ],
    },
    created: {
      extractors: [
        {
          type: "gallery",
          extractor: (data) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `https://pinterest.com${post.seo_url}`,
            })),
        },
      ],
    },
    board: {
      extractors: [
        {
          type: "gallery",
          extractor: (data) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `https://pinterest.com${post.seo_url}`,
            })),
        },
      ],
    },
    pin: {
      extractor: (data) => ({
        url: data.metadata[0].images.orig.url,
        user: data.metadata[0].pinner.username,
        authorThumbnail: data.metadata[0].pinner.image_small_url,
        authorUrl: `https://pinterest.com/${data.metadata[0].pinner.username}`,
        description: data.metadata[0].description,
        date: new Date(data.metadata[0].created_at),
      }),
    },
  },
  patreon: {
    creator: {
      extractors: [
        {
          type: "gallery",
          extractor: (data) => {
            return data.metadata.map((post) => ({
              thumbnail: post.thumbnail.original,
              url: post.url,
            }));
          },
        },
      ],
    },
    post: {
      extractor: (data) => ({
        url: data.metadata[0].thumbnail.original,
        description: data.metadata[0].content,
        authorName: data.metadata[0].creator.vanity,
        authorUrl: data.metadata[0].creator.url,
        authorThumbnail: data.metadata[0].campaign.avatar_photo_url,
      }),
    },
  },
  facebook: {
    user: {
      extractors: [
        {
          type: "gallery",
          urlMatcher: /photos/,
          extractor: (data) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `https://www.facebook.com/photo/?fbid=${post.id}&set=${post.set_id}`,
            })),
        },
      ],
    },
    photo: {
      extractor: (data) => ({
        url: data.metadata[0].url,
        description: data.metadata[0].caption,
        date: new Date(data.metadata[0].date),
        authorName: data.metadata[0].username,
        authorUrl: `https://www.facebook.com/${data.metadata[0].user_id}`,
      }),
    },
  },
  vsco: {
    user: {
      extractors: [
        {
          type: "info",
          urlMatcher: /avatar/,
          extractor: (data) => ({
            name: data.metadata[0]?.user,
            thumbnail: data.urls[0],
          }),
        },
        {
          type: "gallery",
          urlMatcher: /gallery/,
          extractor: (data) =>
            data.metadata.map((post, i) => ({
              thumbnail: data.urls[i],
              url: `https://vsco.co/${post.user}/${post.video ? "video" : "media"}/${post.id}`,
            })),
        },
      ],
    },
    image: {
      extractor: (data) => ({
        url: data.urls[0],
        authorName: data.post[0].user,
        filename: data.metadata[0].filename,
        date: new Date(data.metadata[0].date),
        description: data.metadata[0].description,
        meta: {
          device: `${data.metadata[0].meta.make} ${data.metadata[0].meta.model}`,
        },
        authorUrl: `https://vsco.co/${data.post[0].user}`,
      }),
    },
  },
  instagram: {
    user: {
      extractors: [
        {
          type: "info",
          urlMatcher: /info/,
          extractor: (data) => {
            const avatar = data.post[0];
            return {
              name: avatar?.username,
              thumbnail: avatar?.profile_pic_url_hd,
              category: avatar?.category_name,
              bio: avatar?.biography,
              private: avatar.is_private,
              nickname: avatar.full_name,
              stats: {
                mediaCount: avatar?.edge_owner_to_timeline_media.count,
                followers: avatar?.edge_followed_by.count,
                following: avatar?.edge_follow.count,
              },
            };
          },
        },
        {
          type: "gallery",
          urlMatcher: /posts/,
          extractor: (data) =>
            data.metadata.map((_, i) => ({
              thumbnail: data.urls[i],
              url: data.urls[i],
            })),
        },
      ],
    },
  },
  tiktok: {
    user: {
      extractors: [
        {
          type: "info",
          urlMatcher: /video/,
          unique: true,
          extractor: (data) => {
            const post = data.post[0];
            return {
              name: post.author.uniqueId,
              bio: post.author.signature,
              thumbnail: post.author.avatarLarger,
              verified: post.author.verified,
              nickname: post.author.nickname,
              bioLink: post.author.bioLink?.link,
              stats: {
                followers: post.authorStats.followerCount,
                following: post.authorStats.followingCount,
                mediaCount: post.authorStats.videoCount,
                likeCount: post.authorStats.heartCount,
              },
            };
          },
        },
        {
          type: "post",
          urlMatcher: /video/,
          extractor: (data) => {
            const post = data.post[0];
            return {
              thumbnail: post.video.cover,
              url: `https://tiktok.com/@${post.user}/${data.metadata[0].type === "video" ? "video" : "photo"}/${post.id}`,
              type: data.metadata[0].type,
              videoUrl: post.video.playAddr,
            };
          },
        },
      ],
    },
    post: {
      extractor: (data) => ({
        url: data.post[0].video.cover,
        filename: data.metadata[0].filename,
        date: new Date(data.post[0].date),
        description: data.post[0].desc,
        type: data.metadata[0].type,
        authorName: data.post[0].user,
        authorUrl: `https://tiktok.com/@${data.post[0].user}`,
        authorThumbnail: data.post[0].author.avatarThumb,
        videoUrl: data.urls[0],
      }),
      videoExtractor: (data) => {
        const headers = {
          Accept: data.post[0].http_headers["Accept"],
          Referer: data.post[0].http_headers["Referer"],
          "User-Agent": data.post[0].http_headers["User-Agent"],
          Cookie: encodeURIComponent(data.post[0].cookies.replace(/["]+/g, "")),
        };

        return {
          url: `${import.meta.env.VITE_API_URL}/api/v1/proxy?headers=${JSON.stringify(headers)}&url=${encodeURIComponent(data.post[0].url)}`,
        };
      },
    },
  },
};
