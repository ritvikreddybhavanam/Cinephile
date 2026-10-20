import '../core/config/env.dart';
import 'genre.dart';

/// Full movie details returned by `/api/tmdb/movies/{movieId}`.
class MovieDetail {
  final int id;
  final String title;
  final String? tagline;
  final String overview;
  final String? posterPath;
  final String? backdropPath;
  final String? releaseDate;
  final int? runtime;
  final double voteAverage;
  final int voteCount;
  final List<Genre> genres;
  final int? budget;
  final int? revenue;
  final String? status;
  final String? originalLanguage;
  final String? imdbId;

  const MovieDetail({
    required this.id,
    required this.title,
    this.tagline,
    required this.overview,
    this.posterPath,
    this.backdropPath,
    this.releaseDate,
    this.runtime,
    required this.voteAverage,
    required this.voteCount,
    this.genres = const [],
    this.budget,
    this.revenue,
    this.status,
    this.originalLanguage,
    this.imdbId,
  });

  factory MovieDetail.fromJson(Map<String, dynamic> json) {
    // Parse genres list
    List<Genre> parsedGenres = [];
    if (json['genres'] is List) {
      parsedGenres = (json['genres'] as List)
          .whereType<Map<String, dynamic>>()
          .map((g) => Genre.fromJson(g))
          .toList();
    }

    double parsedRating = 0.0;
    final rawRating = json['vote_average'];
    if (rawRating is num) {
      parsedRating = rawRating.toDouble();
    }

    return MovieDetail(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Untitled',
      tagline: json['tagline'] as String?,
      overview: json['overview'] as String? ?? '',
      posterPath: json['poster_path'] as String?,
      backdropPath: json['backdrop_path'] as String?,
      releaseDate: json['release_date'] as String?,
      runtime: (json['runtime'] as num?)?.toInt(),
      voteAverage: parsedRating,
      voteCount: (json['vote_count'] as num?)?.toInt() ?? 0,
      genres: parsedGenres,
      budget: (json['budget'] as num?)?.toInt(),
      revenue: (json['revenue'] as num?)?.toInt(),
      status: json['status'] as String?,
      originalLanguage: json['original_language'] as String?,
      imdbId: json['imdb_id'] as String?,
    );
  }

  /// Formatted runtime: e.g. "2h 15m" or "45m"
  String get runtimeFormatted {
    if (runtime == null || runtime! <= 0) return '—';
    final hours = runtime! ~/ 60;
    final minutes = runtime! % 60;
    if (hours > 0 && minutes > 0) {
      return '${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h';
    }
    return '${minutes}m';
  }

  /// 4-digit release year
  String get year {
    if (releaseDate == null || releaseDate!.isEmpty) return '—';
    final parts = releaseDate!.split('-');
    return parts.isNotEmpty && parts[0].length == 4 ? parts[0] : '—';
  }

  String get ratingFormatted =>
      voteAverage > 0.0 ? voteAverage.toStringAsFixed(1) : 'NR';

  String? get posterUrl => Env.posterUrl(posterPath);
  String? get backdropUrl => Env.backdropUrl(backdropPath);
}
