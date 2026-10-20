import '../core/config/env.dart';

/// Represents a friend or community activity item in the social feed.
class SocialActivity {
  final int id;
  final int userId;
  final String username;
  final String? userAvatar;
  final String actionType; // REVIEW, LOG, LIKE, WATCHLIST
  final int movieId;
  final String movieTitle;
  final String? moviePoster;
  final double? rating;
  final String? content;
  final DateTime? timestamp;

  const SocialActivity({
    required this.id,
    required this.userId,
    required this.username,
    this.userAvatar,
    required this.actionType,
    required this.movieId,
    required this.movieTitle,
    this.moviePoster,
    this.rating,
    this.content,
    this.timestamp,
  });

  factory SocialActivity.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['timestamp'] != null || json['createdAt'] != null) {
      try {
        parsedDate = DateTime.parse((json['timestamp'] ?? json['createdAt']).toString());
      } catch (_) {}
    }

    String uName = 'Cinephile';
    int uId = 0;
    String? uAvatar;

    if (json['user'] is Map) {
      final u = json['user'] as Map<String, dynamic>;
      uId = (u['id'] as num?)?.toInt() ?? 0;
      uName = u['username'] as String? ?? u['firstname'] as String? ?? 'Cinephile';
      uAvatar = u['avatarUrl'] as String?;
    } else {
      uName = json['username'] as String? ?? 'Cinephile';
      uId = (json['userId'] as num?)?.toInt() ?? 0;
    }

    return SocialActivity(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: uId,
      username: uName,
      userAvatar: uAvatar,
      actionType: json['actionType'] as String? ?? json['activityType'] as String? ?? 'REVIEW',
      movieId: (json['movieId'] as num?)?.toInt() ?? (json['tmdbMovieId'] as num?)?.toInt() ?? 0,
      movieTitle: json['movieTitle'] as String? ?? json['title'] as String? ?? 'Film',
      moviePoster: json['moviePoster'] as String? ?? json['poster'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      content: json['content'] as String? ?? json['reviewText'] as String?,
      timestamp: parsedDate,
    );
  }

  String? get posterUrl => Env.posterUrl(moviePoster);

  DateTime get createdAt => timestamp ?? DateTime.now();

  String get actionDescription {
    switch (actionType.toUpperCase()) {
      case 'LIKE':
        return 'liked this film';
      case 'LOG':
        return 'logged in Film Diary';
      case 'WATCHLIST':
        return 'added to watchlist';
      case 'REVIEW':
      default:
        return rating != null ? 'rated $rating/5.0' : 'reviewed this film';
    }
  }
}
