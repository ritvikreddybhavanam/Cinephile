/// Represents an item in the user's Watchlist.
class WatchlistItem {
  final int id;
  final int movieId;
  final String title;
  final String? poster;
  final DateTime? addedAt;

  const WatchlistItem({
    required this.id,
    required this.movieId,
    required this.title,
    this.poster,
    this.addedAt,
  });

  factory WatchlistItem.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['addedAt'] != null) {
      try {
        parsedDate = DateTime.parse(json['addedAt'].toString());
      } catch (_) {}
    }

    return WatchlistItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      movieId: (json['movieId'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Untitled',
      poster: json['poster'] as String?,
      addedAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'movieId': movieId,
        'title': title,
        'poster': poster,
      };

  String? get posterUrl => poster != null
      ? (poster!.startsWith('http') ? poster! : 'https://image.tmdb.org/t/p/w500$poster')
      : null;
}
