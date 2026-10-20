import '../core/config/env.dart';

/// Represents a movie card/summary item returned by TMDB discovery and search endpoints.
class Movie {
  final int id;
  final String title;
  final String? originalTitle;
  final String? posterPath;
  final String? backdropPath;
  final String overview;
  final String? releaseDate;
  final double voteAverage;
  final int voteCount;
  final List<int> genreIds;
  final String? originalLanguage;
  final double? popularity;

  const Movie({
    required this.id,
    required this.title,
    this.originalTitle,
    this.posterPath,
    this.backdropPath,
    required this.overview,
    this.releaseDate,
    required this.voteAverage,
    required this.voteCount,
    this.genreIds = const [],
    this.originalLanguage,
    this.popularity,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    // Some endpoints or legacy structures use 'name' instead of 'title'
    final movieTitle = json['title'] as String? ?? json['name'] as String? ?? 'Untitled';

    // Parse vote_average safely (can be int, double, or string)
    double parsedRating = 0.0;
    final rawRating = json['vote_average'] ?? json['rating'];
    if (rawRating is num) {
      parsedRating = rawRating.toDouble();
    } else if (rawRating is String) {
      parsedRating = double.tryParse(rawRating) ?? 0.0;
    }

    // Parse genre_ids safely
    List<int> parsedGenres = [];
    if (json['genre_ids'] is List) {
      parsedGenres = (json['genre_ids'] as List)
          .whereType<num>()
          .map((e) => e.toInt())
          .toList();
    } else if (json['genres'] is List) {
      // If full genre objects are returned (e.g. from movie details)
      parsedGenres = (json['genres'] as List)
          .where((g) => g is Map && g['id'] != null)
          .map((g) => (g['id'] as num).toInt())
          .toList();
    }

    return Movie(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: movieTitle,
      originalTitle: json['original_title'] as String?,
      posterPath: json['poster_path'] as String?,
      backdropPath: json['backdrop_path'] as String?,
      overview: json['overview'] as String? ?? '',
      releaseDate: json['release_date'] as String? ?? json['first_air_date'] as String?,
      voteAverage: parsedRating,
      voteCount: (json['vote_count'] as num?)?.toInt() ?? 0,
      genreIds: parsedGenres,
      originalLanguage: json['original_language'] as String?,
      popularity: (json['popularity'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'original_title': originalTitle,
        'poster_path': posterPath,
        'backdrop_path': backdropPath,
        'overview': overview,
        'release_date': releaseDate,
        'vote_average': voteAverage,
        'vote_count': voteCount,
        'genre_ids': genreIds,
        'original_language': originalLanguage,
        'popularity': popularity,
      };

  /// Extract 4-digit release year
  String get year {
    if (releaseDate == null || releaseDate!.isEmpty) return '—';
    final parts = releaseDate!.split('-');
    return parts.isNotEmpty && parts[0].length == 4 ? parts[0] : '—';
  }

  /// Formatted rating string, e.g. "8.4" or "NR"
  String get ratingFormatted {
    if (voteAverage <= 0.0) return 'NR';
    return voteAverage.toStringAsFixed(1);
  }

  /// Full poster URL
  String? get posterUrl => Env.posterUrl(posterPath);

  /// Full backdrop URL
  String? get backdropUrl => Env.backdropUrl(backdropPath);

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Movie && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
