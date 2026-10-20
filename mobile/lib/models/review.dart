import '../core/config/env.dart';

/// Supported review intent categories in Cinephile.
enum ReviewIntent {
  deepAnalysis('Deep Analysis', '🧠'),
  technicalCraft('Technical & Craft', '🎬'),
  generalCritique('General Critique', '✍️'),
  quickTake('Quick Take', '⚡'),
  humor('Humor & Satire', '🍿');

  final String label;
  final String emoji;
  const ReviewIntent(this.label, this.emoji);

  static ReviewIntent fromString(String? val) {
    if (val == null) return ReviewIntent.generalCritique;
    final lower = val.toLowerCase();
    if (lower.contains('deep') || lower.contains('analysis')) return ReviewIntent.deepAnalysis;
    if (lower.contains('technical') || lower.contains('craft')) return ReviewIntent.technicalCraft;
    if (lower.contains('quick')) return ReviewIntent.quickTake;
    if (lower.contains('humor') || lower.contains('satire')) return ReviewIntent.humor;
    return ReviewIntent.generalCritique;
  }
}

/// Represents a review posted by a user in the Cinephile community.
class Review {
  final int id;
  final int movieId;
  final String movieTitle;
  final String? moviePoster;
  final int? movieReleaseYear;
  final int? userId;
  final String username;
  final double rating;
  final String reviewText;
  final bool containsSpoilers;
  final ReviewIntent intent;
  final int likesCount;
  final bool isLikedByCurrentUser;
  final int commentsCount;
  final DateTime? createdAt;

  const Review({
    required this.id,
    required this.movieId,
    required this.movieTitle,
    this.moviePoster,
    this.movieReleaseYear,
    this.userId,
    required this.username,
    required this.rating,
    required this.reviewText,
    this.containsSpoilers = false,
    this.intent = ReviewIntent.generalCritique,
    this.likesCount = 0,
    this.isLikedByCurrentUser = false,
    this.commentsCount = 0,
    this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['createdAt'] != null || json['reviewDate'] != null) {
      try {
        parsedDate = DateTime.parse((json['createdAt'] ?? json['reviewDate']).toString());
      } catch (_) {}
    }

    String uName = 'Cinephile';
    int? uId;
    if (json['user'] is Map) {
      final u = json['user'] as Map<String, dynamic>;
      uId = (u['id'] as num?)?.toInt();
      uName = u['username'] as String? ?? u['firstname'] as String? ?? 'Cinephile';
    } else {
      uName = json['username'] as String? ?? 'Cinephile';
      uId = (json['userId'] as num?)?.toInt();
    }

    return Review(
      id: (json['id'] as num?)?.toInt() ?? 0,
      movieId: (json['movieId'] as num?)?.toInt() ?? (json['tmdbMovieId'] as num?)?.toInt() ?? 0,
      movieTitle: json['movieTitle'] as String? ?? json['title'] as String? ?? 'Untitled',
      moviePoster: json['moviePoster'] as String? ?? json['poster'] as String?,
      movieReleaseYear: (json['movieReleaseYear'] as num?)?.toInt() ?? (json['year'] as num?)?.toInt(),
      userId: uId,
      username: uName,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewText: json['reviewText'] as String? ?? json['content'] as String? ?? '',
      containsSpoilers: json['containsSpoilers'] as bool? ?? false,
      intent: ReviewIntent.fromString(json['intentCategory'] as String? ?? json['intent'] as String?),
      likesCount: (json['likesCount'] as num?)?.toInt() ?? 0,
      isLikedByCurrentUser: json['isLiked'] as bool? ?? false,
      commentsCount: (json['commentsCount'] as num?)?.toInt() ?? 0,
      createdAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() => {
        'movieId': movieId,
        'movieTitle': movieTitle,
        'moviePoster': moviePoster,
        'movieReleaseYear': movieReleaseYear,
        'rating': rating,
        'reviewText': reviewText,
        'containsSpoilers': containsSpoilers,
        'intentCategory': intent.label,
      };

  String? get posterUrl => Env.posterUrl(moviePoster);

  String get intentCategory => intent.label;
}

/// Represents a user comment on a review.
class ReviewComment {
  final int id;
  final int reviewId;
  final int userId;
  final String username;
  final String? userAvatar;
  final String content;
  final int? parentId;
  final DateTime? createdAt;

  const ReviewComment({
    required this.id,
    required this.reviewId,
    required this.userId,
    required this.username,
    this.userAvatar,
    required this.content,
    this.parentId,
    this.createdAt,
  });

  factory ReviewComment.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['createdAt'] != null) {
      try {
        parsedDate = DateTime.parse(json['createdAt'].toString());
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

    return ReviewComment(
      id: (json['id'] as num?)?.toInt() ?? 0,
      reviewId: (json['reviewId'] as num?)?.toInt() ?? 0,
      userId: uId,
      username: uName,
      userAvatar: uAvatar,
      content: json['content'] as String? ?? '',
      parentId: (json['parentId'] as num?)?.toInt(),
      createdAt: parsedDate,
    );
  }
}
