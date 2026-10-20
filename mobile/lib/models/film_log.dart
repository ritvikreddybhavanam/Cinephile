import '../core/config/env.dart';

/// Represents a screening logged into the Film Diary.
class FilmLog {
  final int id;
  final int movieId;
  final String title;
  final int? releaseYear;
  final String? posterPath;
  final DateTime watchedDate;
  final double? rating;
  final String? reviewText;
  final bool containsSpoilers;
  final bool isRewatch;
  final String? loggedLocation;
  final String? companionName;

  const FilmLog({
    required this.id,
    required this.movieId,
    required this.title,
    this.releaseYear,
    this.posterPath,
    required this.watchedDate,
    this.rating,
    this.reviewText,
    this.containsSpoilers = false,
    this.isRewatch = false,
    this.loggedLocation,
    this.companionName,
  });

  factory FilmLog.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate = DateTime.now();
    if (json['watchedDate'] != null) {
      try {
        parsedDate = DateTime.parse(json['watchedDate'].toString());
      } catch (_) {}
    }

    return FilmLog(
      id: (json['id'] as num?)?.toInt() ?? 0,
      movieId: (json['movieId'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Untitled',
      releaseYear: (json['releaseYear'] as num?)?.toInt(),
      posterPath: json['posterPath'] as String?,
      watchedDate: parsedDate,
      rating: (json['rating'] as num?)?.toDouble(),
      reviewText: json['reviewText'] as String?,
      containsSpoilers: json['containsSpoilers'] as bool? ?? false,
      isRewatch: json['isRewatch'] as bool? ?? false,
      loggedLocation: json['loggedLocation'] as String?,
      companionName: json['companionName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'movieId': movieId,
        'title': title,
        'releaseYear': releaseYear,
        'posterPath': posterPath,
        'watchedDate': watchedDate.toIso8601String().split('T').first,
        'rating': rating,
        'reviewText': reviewText,
        'containsSpoilers': containsSpoilers,
        'isRewatch': isRewatch,
        'loggedLocation': loggedLocation,
        'companionName': companionName,
      };

  String? get posterUrl => Env.posterUrl(posterPath);

  String get formattedWatchedDate => '${watchedDate.day}/${watchedDate.month}/${watchedDate.year}';
}

/// Statistics aggregated across user's Film Diary.
class DiaryStats {
  final int totalWatched;
  final int totalHours;
  final int totalReviews;
  final int totalRewatches;
  final double averageRating;
  final Map<String, int> monthlyDistribution;

  const DiaryStats({
    this.totalWatched = 0,
    this.totalHours = 0,
    this.totalReviews = 0,
    this.totalRewatches = 0,
    this.averageRating = 0.0,
    this.monthlyDistribution = const {},
  });

  factory DiaryStats.fromJson(Map<String, dynamic> json) {
    return DiaryStats(
      totalWatched: (json['totalWatched'] as num?)?.toInt() ?? (json['watchedCount'] as num?)?.toInt() ?? 0,
      totalHours: (json['totalHours'] as num?)?.toInt() ?? 0,
      totalReviews: (json['totalReviews'] as num?)?.toInt() ?? 0,
      totalRewatches: (json['totalRewatches'] as num?)?.toInt() ?? 0,
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      monthlyDistribution: (json['monthlyDistribution'] is Map)
          ? (json['monthlyDistribution'] as Map).map((k, v) => MapEntry(k.toString(), (v as num).toInt()))
          : const {},
    );
  }
}
