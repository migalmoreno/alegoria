const itemTypes = ["video"] as const;
type ItemType = (typeof itemTypes)[number];

interface PreciseDuration {
  preciseAuditionDuration: number;
  preciseDuration: number;
  preciseShootDuration: number;
  preciseVideoDuration: number;
}

interface ItemMusic {
  authorName: string;
  collected: false;
  coverLarge: string;
  coverMedium: string;
  coverThumb: string;
  duration: number;
  id: string;
  isCopyrighted: boolean;
  original: true;
  playUrl: string;
  private: boolean;
  scheduleSearchTime: boolean;
  title: string;
  preciseDuration: PreciseDuration;
}

interface Statistics {
  collectCount: string;
  commentCount: number;
  diggCount: number;
  playCount: number;
  shareCount: number;
}

interface StatisticsV2 {
  collectCount: string;
  commentCount: string;
  diggCount: string;
  playCount: string;
  repostCount: string;
  shareCount: string;
}

interface SubtitleInfo {
  Format: string;
  LanguageCodeName: string;
  LanguageId: string;
  Size: string;
  Source: string;
  Url: string;
  UrlExpire: string;
  Version: string;
}

interface ClaCaptionInfo {
  captionFormat: string;
  claSubtitleID: string;
  expire: string;
  isAutoGen: boolean;
  isOriginalCaption: boolean;
  language: string;
  languageCode: string;
  languageID: string;
  subID: string;
  subtitleType: string;
  translationType: string;
  url: string;
  urlList: string[];
  variant: string;
}

interface ClaOriginalLanguageInfo {
  canTranslateRealTimeNoCheck: boolean;
  language: string;
  languageCode: string;
  languageID: string;
}

interface ClaInfo {
  captionInfos: ClaCaptionInfo[];
  captionsType: string;
  enableAutoCaption: boolean;
  hasOriginalAudio: boolean;
  noCaptionReason: string | null;
  originalLanguageInfo: ClaOriginalLanguageInfo;
}

interface ItemVideo {
  bitrate: number;
  claInfo: ClaInfo;
  codecType: string;
  cover: string;
  definition: string;
  downloadAddr: string;
  duration: number;
  dynamicCover: string;
  originCover: string;
  format: string;
  encodedUserTag: string;
  encodedType: string;
  height: number;
  id: string;
  playAddr: string;
  ratio: string;
  reflowCover: string;
  shareCover: string[];
  size: string;
  videoID: string;
  videoQuality: string;
  width: number;
  subtitleInfos: SubtitleInfo[];
  zoomCover: Record<string, string>;
}

interface Sticker {
  stickerText: string[];
  stickerType: number;
}

const subcategoryTypes = ["tiktokcdn.com", "post"] as const;
type PostSubCategory = (typeof subcategoryTypes)[number];

const categoryTypes = ["tiktok", "directlink"] as const;
type PostCategory = (typeof categoryTypes)[number];

export interface TikTokVideoItem {
  CategoryType: number;
  createdTime: string;
  id: string;
  isAd: boolean;
  locationCreated: string;
  suggestedWords: string[];
  textLanguage: string;
  textTranslatable: boolean;
  title: string;
  type: ItemType;
  stats: Statistics;
  statsV2: StatisticsV2;
  user: string;
  width: number;
  music: ItemMusic;
  video: ItemVideo;
  stickersOnItem: Sticker[];
  subcategory: PostSubCategory;
  category: PostCategory;
  author: TikTokAvatarItem;
  authorStats: AuthorStats;
  authorStatsV2: AuthorStatsV2;
}

interface AuthorStats {
  diggCount: number;
  followerCount: number;
  followingCount: number;
  friendCount: number;
  heart: number;
  heartCount: number;
  videoCount: number;
}

interface AuthorStatsV2 {
  diggCount: string;
  followerCount: string;
  followingCount: string;
  friendCount: string;
  heart: string;
  heartCount: string;
  videoCount: string;
}

interface BioLink {
  link: string;
  risk: number;
}

interface CommerceUserInfo {
  category: string;
  categoryButton: false;
  commerceUser: boolean;
  downloadLink: Record<string, string>;
}

interface ProfileTab {
  showMusicTab: boolean;
  showPlaylistTab: boolean;
  showQuestionTab: boolean;
}

interface TikTokAvatarItem {
  UserStoryStatus: number;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  bioLink: BioLink;
  canExpPlaylist: boolean;
  category: string;
  commentSetting: number;
  commerceUserInfo: CommerceUserInfo;
  createTime: number;
  downloadSetting: number;
  duetSetting: number;
  eventList: unknown[];
  extension: string;
  filename: string;
  followingVisibility: number;
  ftc: boolean;
  id: string;
  img_id: string;
  isADVirtual: boolean;
  isEmbedBanned: boolean;
  isOrganization: number;
  language: string;
  nickNameModifyTime: number;
  nickname: string;
  noInvitationCardUrl: string;
  numb: number;
  openFavorite: boolean;
  privateAccount: boolean;
  profileEmbedPermission: number;
  profileTab: ProfileTab;
  recommendReason: string;
  relation: number;
  roomId: string;
  secUid: string;
  secret: boolean;
  shortId: string;
  signature: string;
  stitchSetting: number;
  subcategory: string;
  suggestAccountBind: boolean;
  title: string;
  ttSeller: boolean;
  type: string;
  uniqueId: string;
  uniqueIdModifyTime: number;
  user: string;
  verified: boolean;
}

export interface TikTokPostItem {
  AIGCDescription: string;
  CategoryType: number;
  isAigc: boolean;
  author: TikTokAvatarItem;
  authorStats: AuthorStats;
  authorStatsV2: AuthorStatsV2;
  backendSourceEventTracking: string;
  category: "tiktok";
  challenges: unknown[];
  channelTags: string[];
  collected: boolean;
  comments: unknown[];
  contents: { desc: string; textExtra: string[] };
  createTime: string;
  creatorAIComment: {
    categoryList: string[];
    eligibleVideo: boolean;
    hasAITopic: boolean;
    noEligibleReason: number;
  };
  date: string;
  desc: string;
  digged: boolean;
  diversificationId: number;
  diversificationLabels: string[];
  duetDisplay: number;
  effectStickers: unknown[];
  forFriend: boolean;
  id: string;
  indexEnabled: boolean;
  isAd: boolean;
  isReviewing: boolean;
  itemCommentStatus: number;
  item_control: { can_repost: boolean };
  locationCreated: string;
  music: ItemMusic;
  officalItem: boolean;
  originalItem: boolean;
  privateItem: boolean;
  scheduleTime: number;
  secret: boolean;
  shareEnabled: boolean;
  stats: Statistics;
  statsV2: StatisticsV2;
  stickersOnItem: unknown[];
  stitchDisplay: number;
  subcategory: "post";
  suggestedWords: string[];
  takeDown: number;
  textExtra: string[];
  textLanguage: string;
  textTranslatable: boolean;
  user: string;
  video: ItemVideo;
  warnInfo: string[];
}

export type TikTokMetadataItem = TikTokAvatarItem & TikTokVideoItem;
