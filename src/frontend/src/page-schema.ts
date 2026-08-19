// @ts-nocheck
export const pageSchema = {
  c0d3c7b1: {
    "1776446d": {
      extractors: [
        {
          type: "gallery",
          extractor: (data, baseUrl) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `${baseUrl}/pin/${post.id}`,
              authorName: post.pinner.username,
              authorThumbnail: post.pinner.image_small_url,
              authorUrl: `${baseUrl}/${post.pinner.username}`,
              groupName: post.board?.name,
              groupThumbnail: post.board?.image_cover_url,
              groupUrl: `${baseUrl}${post.board?.url}`,
            })),
        },
      ],
    },
    "1692405e": {
      extractors: [
        {
          type: "group-board",
          extractor: (data, baseUrl) =>
            data.metadata.map((post) => ({
              name: post.name,
              thumbnail: post.image_cover_url,
              url: `${baseUrl}${encodeURIComponent(post.url)}`,
              count: post.pin_count,
              date: new Date(post.created_at),
            })),
        },
      ],
    },
    "22c9473f": {
      extractors: [
        {
          type: "gallery",
          extractor: (data, baseUrl) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `${baseUrl}${post.seo_url}`,
            })),
        },
      ],
    },
    "2b9db8bf": {
      extractors: [
        {
          type: "gallery",
          extractor: (data, baseUrl) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `${baseUrl}${post.seo_url}`,
            })),
        },
      ],
    },
    e3df3be0: {
      extractor: (data, baseUrl) => ({
        url: `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${data.metadata[0].url}`,
        authorName: data.metadata[0].pinner.username,
        authorThumbnail: data.metadata[0].pinner.image_small_url,
        authorUrl: `${baseUrl}/${data.metadata[0].pinner.username}`,
        description: data.metadata[0].description,
        date: new Date(data.metadata[0].created_at),
        groupName: data.metadata[0].board.name,
        groupThumbnail: data.metadata[0].board.image_cover_url,
        groupUrl: `${baseUrl}${data.metadata[0].board.url}`,
      }),
    },
  },
  "27b9c082": {
    "67b6f7ae": {
      extractors: [
        {
          type: "gallery",
          extractor: (data) => {
            return data.metadata.map((post) => ({
              thumbnail: post.thumbnail?.original,
              url: post.url,
            }));
          },
        },
      ],
    },
    "4b1b2ee4": {
      extractor: (data) => ({
        url: data.metadata[0].thumbnail.original,
        description: data.metadata[0].content,
        authorName: data.metadata[0].creator.vanity,
        authorUrl: data.metadata[0].creator.url,
        authorThumbnail: data.metadata[0].campaign.avatar_photo_url,
      }),
    },
  },
  "5c6e7131": {
    "9d8e01de": {
      extractors: [
        {
          type: "gallery",
          urlMatcher: /photos/,
          extractor: (data, baseUrl) =>
            data.metadata.map((post) => ({
              thumbnail: post.url,
              url: `${baseUrl}/photo/?fbid=${post.id}&set=${post.set_id}`,
            })),
        },
      ],
    },
    dc1d7def: {
      extractor: (data, baseUrl) => ({
        url: data.metadata[0].url,
        description: data.metadata[0].caption,
        date: new Date(data.metadata[0].date),
        authorName: data.metadata[0].username,
        authorUrl: `${baseUrl}/${data.metadata[0].user_id}`,
      }),
    },
  },
  f3a30c28: {
    "3418ee8b": {
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
          extractor: (data, baseUrl) =>
            data.metadata.map((post, i) => ({
              thumbnail: data.urls[i],
              url: `${baseUrl}/${post.user}/${post.video ? "video" : "media"}/${post.id}`,
            })),
        },
      ],
    },
    "77240af5": {
      extractor: (data, baseUrl) => ({
        url: data.urls[0],
        authorName: data.post[0].user,
        filename: data.metadata[0].filename,
        date: new Date(data.metadata[0].date),
        description: data.metadata[0].description,
        meta: {
          device: `${data.metadata[0].meta.make} ${data.metadata[0].meta.model}`,
        },
        authorUrl: `${baseUrl}/${data.post[0].user}`,
      }),
    },
  },
  e88db17b: {
    a3848f58: {
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
  b8d92073: {
    f374b090: {
      extractors: [
        {
          type: "info",
          urlMatcher: /avatar/,
          extractor: (data) => ({
            thumbnail: data.urls[0],
            name: data.post[0]?.nickname,
            bio: data.post[0]?.signature,
            verified: data.post[0]?.verified,
          }),
        },
        {
          type: "gallery",
          urlMatcher: /posts/,
          extractor: (data, baseUrl) =>
            data.post.map((post, i) => ({
              thumbnail: post.video.cover,
              url: `${baseUrl}/@${post.user}/${data.metadata[i]?.type === "video" ? "video" : "photo"}/${post.id}`,
            })),
        },
      ],
    },
    "33295e95": {
      extractor: (data, baseUrl) => {
        const cookieStr = Object.entries(data.cookies ?? {})
          .map(([k, v]) => `${k}=${v}`)
          .join("; ");
        const headers = {
          ...(data.http_headers ?? {}),
          ...(cookieStr ? { Cookie: cookieStr } : {}),
        };
        return {
          url: data.post[0].video.cover,
          posterUrl: data.post[0].video.cover,
          filename: data.metadata[0].filename,
          date: new Date(data.post[0].date),
          description: data.post[0].desc,
          type: data.metadata[0].type,
          authorName: data.post[0].user,
          authorUrl: `${baseUrl}/@${data.post[0].user}`,
          authorThumbnail: data.post[0].author.avatarThumb,
          videoUrl: `${import.meta.env.VITE_API_URL}/api/v1/proxy?headers=${encodeURIComponent(JSON.stringify(headers))}&url=${encodeURIComponent(data.urls[0])}`,
        };
      },
    },
  },
};
