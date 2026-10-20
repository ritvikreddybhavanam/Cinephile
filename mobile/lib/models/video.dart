import '../core/config/env.dart';

/// Represents a movie trailer, teaser, or clip.
class VideoTrailer {
  final String id;
  final String key;
  final String name;
  final String site;
  final String type;
  final bool official;

  const VideoTrailer({
    required this.id,
    required this.key,
    required this.name,
    required this.site,
    required this.type,
    this.official = false,
  });

  factory VideoTrailer.fromJson(Map<String, dynamic> json) {
    return VideoTrailer(
      id: json['id'] as String? ?? '',
      key: json['key'] as String? ?? '',
      name: json['name'] as String? ?? 'Video',
      site: json['site'] as String? ?? 'YouTube',
      type: json['type'] as String? ?? 'Trailer',
      official: json['official'] as bool? ?? false,
    );
  }

  /// Whether this is a YouTube video
  bool get isYouTube => site.toLowerCase() == 'youtube';

  /// Full YouTube watch URL
  String get youtubeUrl => 'https://www.youtube.com/watch?v=$key';

  /// YouTube thumbnail image URL
  String get thumbnailUrl => Env.youtubeThumbnail(key);
}
