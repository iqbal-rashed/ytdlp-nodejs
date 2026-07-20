/**
 * Shared constants for yt-dlp operations
 */
/**
 * Video info fields to collect after download (post-processing complete).
 * Used by download operations to capture metadata via --print.
 */
export declare const VIDEO_INFO_FIELDS: readonly ["id", "title", "fulltitle", "ext", "alt_title", "description", "display_id", "uploader", "uploader_id", "uploader_url", "license", "creators", "creator", "timestamp", "upload_date", "release_timestamp", "release_date", "release_year", "modified_timestamp", "modified_date", "channel", "channel_id", "channel_url", "channel_follower_count", "channel_is_verified", "location", "duration", "duration_string", "view_count", "concurrent_view_count", "like_count", "dislike_count", "repost_count", "average_rating", "comment_count", "save_count", "age_limit", "live_status", "is_live", "was_live", "playable_in_embed", "availability", "media_type", "start_time", "end_time", "extractor", "extractor_key", "epoch", "autonumber", "video_autonumber", "n_entries", "playlist_id", "playlist_title", "playlist", "playlist_count", "playlist_index", "playlist_autonumber", "playlist_uploader", "playlist_uploader_id", "playlist_channel", "playlist_channel_id", "playlist_webpage_url", "webpage_url", "webpage_url_basename", "webpage_url_domain", "original_url", "categories", "tags", "cast", "filepath"];
/**
 * Builds the --print argument for capturing video info after download.
 * Uses %(field|null)j format to output JSON-encoded values with null fallback.
 */
export declare function buildVideoInfoPrintArg(): string;
/**
 * Builds the --print argument for capturing video info before download starts.
 * Uses before_dl hook to fire callback before download begins.
 */
export declare function buildBeforeDownloadPrintArg(): string;
/**
 * Returns the standard extra arguments for download operations.
 * Includes video info printing and progress output.
 */
export declare function getDownloadPrintArgs(): string[];
