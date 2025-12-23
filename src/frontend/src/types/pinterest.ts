interface CoverImage {
  height: number | null;
  url: string;
  width: number;
}

interface CoverPin {
  crop: number[];
  custom_cover: boolean;
  image_signature: string;
  image_size: number | null[];
  image_url: string;
  pin_id: string;
  scale: number;
  size: number[];
  timestamp: number;
}

interface Owner {
  ads_only_profile_site: boolean | null;
  blocked_by_me: boolean;
  domain_url: string;
  domain_verified: boolean;
  explicitly_followed_by_me: boolean;
  follower_count: number;
  full_name: string;
  id: string;
  image_medium_url: string;
  image_small_url: string;
  is_ads_only_profile: boolean;
  is_primary_website_verified: boolean;
  is_default_image: boolean;
  is_partner: boolean;
  is_private_profile: boolean;
  is_verified_merchant: boolean;
  node_id: string;
  type: string;
  username: string;
  verified_identity: {};
}

export interface PinterestBoardItem {
  access: [];
  allow_homefeed_recommendations: boolean;
  archived_by_me_at: string;
  board_order_modified_at: string;
  board_vase: string | null;
  category: "pinterest";
  collaborated_by_me: boolean;
  collaborating_users: [];
  collaborator_count: number;
  collaborator_requests_enabled: boolean;
  cover_images: {
    "200x150": CoverImage;
    "222x": CoverImage;
  };
  cover_pin: CoverPin;
  created_at: string;
  description: string;
  event_date: string | null;
  event_start_date: string | null;
  followed_by_me: boolean;
  follower_count: number;
  has_custom_cover: boolean;
  id: string;
  image_cover_hd_url: string;
  image_cover_url: string;
  is_ads_only: boolean;
  is_collaborative: boolean;
  name: string;
  node_id: string;
  owner: Owner;
  pin_count: number;
  place_saves_count: number;
  privacy: string;
  section_count: number;
  sensitivity_screen: {
    show_warning: boolean;
    reason: string | null;
  };
  should_show_board_collaborators: boolean;
  should_show_more_ideas: boolean;
  should_show_shop_feed: boolean;
  subcategory: string;
  tracking_params: string;
  type: string;
  url: string;
  viewer_collaborator_join_requested: boolean;
}

interface Score {
  count: number;
  score: number;
}

export interface PinterestImageItem {
  access: [];
  aggregated_pin_data: {
    aggregated_stats: {
      done: number;
      saves: number;
      creator_analytics: number | null;
      did_it_data: {
        details_count: number;
        images_count: number;
        rating: number;
        recommended_scores: Score[];
        recommended_count: number;
        responses_count: number;
        tags: string[];
        type: string;
        user_count: number;
        videos_count: number;
      };
    };
    has_xy_tags: boolean;
    id: string;
    is_shop_the_look: boolean;
    node_id: string;
  };
  alt_text: string | null;
  attribution: string | null;
  auto_alt_text: string;
  board: PinterestBoardItem;
  call_to_action_text: string | null;
  campaign_id: string | null;
  carousel_data: string | null;
  category: "pinterest";
  closeup_attribution: Owner;
  closeup_description: string;
  closeup_unified_attribution: Owner;
  closeup_unified_description: string;
  closeup_user_note: string;
  collection_pin: string | null;
  count: number;
  created_at: Date;
  creator_analytics: string | null;
  debug_info_html: string | null;
  description: string;
  digital_media_source_type: string | null;
  domain: string;
  dominant_color: string;
  done_by_me: boolean;
  embed: string | null;
  extension: string;
  favorite_user_count: number;
  favorited_by_me: boolean;
  filename: string;
  grid_attribution: string | null;
  grid_title: string;
  has_required_attribution_provider: boolean;
  height: number;
  id: string;
  image_crop: {
    max_y: number;
    min_y: number;
  };
  image_signature: string;
  images: {
    "136x136": CoverImage;
    "170x": CoverImage;
    "236x": CoverImage;
    "474x": CoverImage;
    "736x": CoverImage;
    orig: CoverImage;
  };
  insertion_id: string | null;
  is_downstream_promotion: boolean;
  is_eligible_for_pdp: boolean;
  is_eligible_for_pre_loved_goods_label: boolean;
  is_eligible_for_related_products: boolean;
  is_go_linkless: boolean;
  is_native: boolean;
  is_oos_product: boolean;
  is_promoted: boolean;
  is_quick_promotable: boolean;
  is_repin: boolean;
  is_stale_product: boolean;
  link: string;
  link_domain: string | null;
  link_utm_applicable_and_replaced: number;
  media_id: string;
  native_creator: string | null;
  node_id: string;
  num: number;
  page_id: string;
  pinner: Owner;
  product_metadata: {} | null;
  product_pin_data: {} | null;
  promoted_is_lead_ad: boolean;
  promoted_is_removable: boolean;
  promoted_lead_form: {} | null;
  promoter: {} | null;
  reaction_counts: { 1: number };
  repin_count: number;
  rich_summary: {
    actions: [];
    apple_touch_icon_images: {
      orig: string;
    };
    apple_touch_icon_link: string;
    display_description: string;
    display_name: string;
    favicon_images: {
      orig: string;
    };
    favicon_link: string;
    id: string;
    products: [];
    site_name: string;
    type: string;
    type_name: string;
    url: string;
  };
  seo_alt_text: string;
  seo_url: string;
  shopping_flags: [];
  should_open_in_stream: boolean;
  sponsorship: {} | null;
  story_pin_data: {} | null;
  story_pin_data_id: string | null;
  subcategory: string;
  title: string;
  tracking_params: string;
  type: string;
  unified_user_note: string;
  url: string;
  utm_link: string | null;
  video_status: string | null;
  videos: {} | null;
  width: number;
}
