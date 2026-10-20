import 'watchlist_item.dart';

/// Represents a custom or curated movie list.
class MovieList {
  final int id;
  final String name;
  final String description;
  final bool isPrivate;
  final String? creatorName;
  final int movieCount;
  final List<WatchlistItem> movies;

  const MovieList({
    required this.id,
    required this.name,
    required this.description,
    this.isPrivate = false,
    this.creatorName,
    this.movieCount = 0,
    this.movies = const [],
  });

  factory MovieList.fromJson(Map<String, dynamic> json) {
    List<WatchlistItem> items = [];
    if (json['movies'] is List) {
      items = (json['movies'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => WatchlistItem.fromJson(m))
          .toList();
    }

    return MovieList(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Untitled List',
      description: json['description'] as String? ?? '',
      isPrivate: json['isPrivate'] as bool? ?? false,
      creatorName: json['user'] is Map ? json['user']['username'] ?? json['user']['firstname'] : null,
      movieCount: (json['movieCount'] as num?)?.toInt() ?? items.length,
      movies: items,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'isPrivate': isPrivate,
      };

  String? get authorName => creatorName;
}
