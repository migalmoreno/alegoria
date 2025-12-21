interface Thumbnail {
  default: string;
  default_blurred: string;
  default_blurred_small: string;
  default_small: string;
  default_large: string;
  height: number;
  original: string;
  thumbnail: string;
  thumbnail_large: string;
  thumbnail_small: string;
  url: string;
  width: number;
}
interface Campaign {
  avatar_photo_image_urls: Thumbnail;
  avatar_photo_url: string;
  currency: string;
  earnings_visibility: string;
  is_monthly: boolean;
  is_nsfw: boolean;
  name: string;
  show_audio_post_download_links: boolean;
  url: string;
}

interface SocialConnection {
  url?: string;
  user_id: string;
}

interface SocialConnections {
  discord: SocialConnection | null;
  facebook: SocialConnection | null;
  google: SocialConnection | null;
  instagram: SocialConnection | null;
  reddit: SocialConnection | null;
  spotify: SocialConnection | null;
  spotify_open_access: SocialConnection | null;
  tiktok: SocialConnection | null;
  twitch: SocialConnection | null;
  twitter: SocialConnection | null;
  twitter2: SocialConnection | null;
  vimeo: SocialConnection | null;
  youtube: SocialConnection | null;
}

interface Creator {
  about: string;
  created: string;
  current_user_block_status: string;
  date: string;
  facebook: string;
  first_name: string;
  full_name: string;
  gender: number;
  id: string;
  image_url: string;
  last_name: string;
  social_connections: SocialConnections;
  thumb_url: string;
  twitch: string | null;
  twitter: string | null;
  url: string;
  vanity: string;
  youtube: string | null;
}

interface Image {
  height: number;
  large_url: string;
  thumb_square_large_url: string;
  thumb_square_url: string;
  thumb_url: string;
  url: string;
  width: number;
}

interface PostFile {
  closed_captions_enabled: boolean;
  default_thumbnail: {
    url: string;
    position: number;
  };
  duration: number;
  expires_at: string;
  full_content_duration: number;
  height: number;
  media_id: number;
  progress: {
    is_watched: boolean;
    watch_state: string;
  };
  state: string;
  story_board: {
    json_url: string;
    vtt_url: string;
  };
  transcript_url: string;
  url: string;
  video_issues: {};
  viewer_playback_data: {
    playback_id: string;
    playback_token: string;
    playback_token_expiry: string;
    url: string;
  };
  width: number;
}

export interface PatreonItem {
  attachments: string[];
  attachments_media: string[];
  campaign: Campaign;
  category: "patreon";
  change_visibility_at: string;
  comment_count: number;
  commenter_count: number;
  content: string;
  creator: Creator;
  current_user_can_comment: boolean;
  current_user_can_delete: boolean;
  current_user_can_view: boolean;
  date: string;
  embed: string | null;
  extension: string;
  filename: string;
  has_ti_violation: boolean;
  hash: string;
  id: number;
  image: Image;
  images: [];
  is_paid: boolean;
  like_count: number;
  meta_image_url: string;
  min_cents_pledged_to_view: number;
  moderation_status: string;
  num: number;
  patreon_url: string;
  pledge_url: string;
  pls_one_liners_by_category: [];
  post_file: PostFile;
  post_level_suspension_removal_date: string | null;
  post_metadata: { platform: string | null };
  post_type: string;
  preview_asset_type: string;
  published_at: string;
  subcategory: string;
  tags: string[];
  teaser_text: string | null;
  thumbnail: Thumbnail;
  title: string;
  type: string;
  upgrade_url: string;
  url: string;
  video_preview: string | null;
  was_posted_by_campaign_owner: boolean;
}
