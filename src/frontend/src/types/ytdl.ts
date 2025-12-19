interface HttpHeaders {
  Accept: string;
  "Accept-Language": string;
  Referer: string;
  "Sec-Fetch-Mode": string;
  "User-Agent": string;
}

interface YtdlFormat {
  abr: boolean | null;
  acodec: string;
  aspect_ratio: string | null;
  audio_ext: string;
  cookies: string;
  dynamic_range: string;
  ext: string;
  filesize_approx: number | null;
  format: string;
  format_id: string;
  format_note: string;
  http_headers: HttpHeaders;
  preference: number;
  protocol: string;
  resolution: string | null;
  tbr: boolean | null;
  url: string;
  vbr: boolean | null;
  vcodec: string;
  video_ext: string;
}

interface Thumbnail {
  id: string;
  preference: number;
  url: string;
}

export interface YtdlItem {
  abr: boolean | null;
  acodec: string;
  artist: string;
  artists: string[];
  aspect_ratio: number;
  audio_ext: string;
  category: "ytdl";
  channel: string;
  channel_id: string;
  channel_url: string;
  comment_count: number;
  cookies: string;
  description: string;
  display_id: string;
  duration: number;
  duration_string: string;
  dynamic_range: string;
  epoch: number;
  ext: string;
  extension: string | null;
  extractor: string;
  extractor_key: string;
  filesize: number;
  format: string;
  format_id: string;
  format_note: string | null;
  formats: YtdlFormat[];
  fulltitle: string;
  height: number;
  http_headers: HttpHeaders;
  id: string;
  like_count: number;
  original_url: string;
  playlist: string | null;
  playlist_index: string | null;
  preference: number;
  protocol: string;
  quality: number;
  release_year: string | null;
  repost_count: number;
  requested_subtitles: boolean | null;
  resolution: string;
  subcategory: string;
  subtitles: unknown;
  tbr: number;
  thumbnail: string;
  thumbnails: Thumbnail[];
  timestamp: number;
  title: string;
  track: string;
  upload_date: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  url: string;
  vbr: boolean | null;
  vcodec: string;
  video_ext: string;
  view_count: number;
  webpage_url: string;
  webpage_url_basename: string;
  webpage_url_domain: string;
  width: number;
}
