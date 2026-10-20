/// Represents a movie logged as watched by the user.
class WatchedMovie {
  final int id;
  final int movieId;
  final String title;
  final String? poster;
  final int? year;
  final String? genre;
  final String? service;
  final double? rating;
  final String? language;
  final DateTime? watchedAt;

  const WatchedMovie({
    required this.id,
    required this.movieId,
    required this.title,
    this.poster,
    this.year,
    this.genre,
    this.service,
    this.rating,
    this.language,
    this.watchedAt,
  });

  factory WatchedMovie.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['watchedAt'] != null) {
      try {
        parsedDate = DateTime.parse(json['watchedAt'].toString());
      } catch (_) {}
    }

    return WatchedMovie(
      id: (json['id'] as num?)?.toInt() ?? 0,
      movieId: (json['movieId'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Untitled',
      poster: json['poster'] as String?,
      year: (json['year'] as num?)?.toInt(),
      genre: json['genre'] as String?,
      service: json['service'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      language: json['language'] as String?,
      watchedAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() => {
        'movieId': movieId,
        'title': title,
        'poster': poster,
        'year': year,
        'genre': genre,
        'service': service,
        'rating': rating,
        'language': language,
      };

  String? get posterUrl => poster != null
      ? (poster!.startsWith('http') ? poster! : 'https://image.tmdb.org/t/p/w500$poster')
      : null;
}
