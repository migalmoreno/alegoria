interface InstagramProfile {
  biography: string;
  category_name: string;
  edge_follow: { count: number };
  edge_followed_by: { count: number };
  edge_owner_to_timeline_media: { count: number };
  full_name: string;
  has_clips: boolean;
  hide_like_and_view_counts: boolean;
  highlight_reel_count: number;
  is_joined_recently: boolean;
  is_private: true;
  is_verified: boolean;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  pronounts: string[];
  username: string;
}

export type InstagramPost = InstagramProfile;
