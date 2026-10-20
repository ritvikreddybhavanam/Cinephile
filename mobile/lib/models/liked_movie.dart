import '../core/config/env.dart';

/// Represents a movie favorited/liked by the user, enriched with director & genre info.
class LikedMovie {
  final int id;
  final int movieId;
  final String title;
  final String? posterPath;
  final String? backdropPath;
  final String? director;
  final double rating;
  final String? year;
  final String? overview;
  final List<String> genres;
  final DateTime? likedAt;

  const LikedMovie({
    required this.id,
    required this.movieId,
    required this.title,
    this.posterPath,
    this.backdropPath,
    this.director,
    required this.rating,
    this.year,
    this.overview,
    this.genres = const [],
    this.likedAt,
  });

  factory LikedMovie.fromJson(Map<String, dynamic> json) {
    // Release year extraction
    String? yearParsed;
    final releaseDate = json['release_date'] as String?;
    if (releaseDate != null && releaseDate.isNotEmpty) {
      final parts = releaseDate.split('-');
      if (parts.isNotEmpty) yearParsed = parts[0];
    }

    // Genres parsing
    List<String> genreNames = [];
    if (json['genres'] is List) {
      genreNames = (json['genres'] as List)
          .map((g) => g is Map ? (g['name'] as String? ?? '') : g.toString())
          .where((s) => s.isNotEmpty)
          .toList();
    }

    double parsedRating = 0.0;
    final rawRating = json['vote_average'] ?? json['rating'];
    if (rawRating is num) {
      parsedRating = rawRating.toDouble();
    }

    return LikedMovie(
      id: (json['id'] as num?)?.toInt() ?? 0,
      movieId: (json['movieId'] as num?)?.toInt() ?? (json['tmdbMovieId'] as num?)?.toInt() ?? (json['id'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Untitled',
      posterPath: json['poster_path'] as String? ?? json['poster'] as String?,
      backdropPath: json['backdrop_path'] as String?,
      director: json['director'] as String?,
      rating: parsedRating,
      year: yearParsed,
      overview: json['overview'] as String?,
      genres: genreNames,
    );
  }

  String? get posterUrl => Env.posterUrl(posterPath);
}
