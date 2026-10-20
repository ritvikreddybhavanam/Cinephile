import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/movie.dart';
import '../models/movie_detail.dart';
import '../models/watched_movie.dart';

/// Service managing movies logged as Watched.
class WatchedService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<WatchedMovie> _watchedMovies = [];
  final Set<int> _watchedMovieIds = {};
  bool _isLoading = false;

  WatchedService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<WatchedMovie> get watchedMovies => _watchedMovies;
  bool get isLoading => _isLoading;

  bool isWatched(int movieId) => _watchedMovieIds.contains(movieId);

  /// Fetch user's watched movies
  Future<List<WatchedMovie>> fetchWatchedMovies() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.watched);
      if (response is List) {
        _watchedMovies = response
            .whereType<Map<String, dynamic>>()
            .map((item) => WatchedMovie.fromJson(item))
            .toList();
        _watchedMovieIds.clear();
        for (final m in _watchedMovies) {
          _watchedMovieIds.add(m.movieId);
        }
      }
      return _watchedMovies;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Mark movie as watched
  Future<void> markAsWatched(dynamic movie, {double? rating, String? platform}) async {
    int movieId = 0;
    String title = '';
    String? poster;
    int? year;
    String? genre;

    if (movie is Movie) {
      movieId = movie.id;
      title = movie.title;
      poster = movie.posterPath;
      year = int.tryParse(movie.year);
    } else if (movie is MovieDetail) {
      movieId = movie.id;
      title = movie.title;
      poster = movie.posterPath;
      year = int.tryParse(movie.year);
      genre = movie.genres.map((g) => g.name).join(', ');
    } else if (movie is Map<String, dynamic>) {
      movieId = (movie['id'] as num?)?.toInt() ?? 0;
      title = movie['title'] as String? ?? 'Untitled';
      poster = movie['poster_path'] as String? ?? movie['poster'] as String?;
    }

    _watchedMovieIds.add(movieId);
    final temp = WatchedMovie(
      id: DateTime.now().millisecondsSinceEpoch,
      movieId: movieId,
      title: title,
      poster: poster,
      year: year,
      genre: genre,
      service: platform,
      rating: rating,
      watchedAt: DateTime.now(),
    );
    _watchedMovies.insert(0, temp);
    notifyListeners();

    try {
      await _apiClient.post(
        ApiEndpoints.watched,
        body: temp.toJson(),
      );
    } catch (e) {
      _watchedMovieIds.remove(movieId);
      _watchedMovies.removeWhere((item) => item.movieId == movieId);
      notifyListeners();
      rethrow;
    }
  }

  /// Remove movie from watched
  Future<void> removeFromWatched(int movieId) async {
    final existingIndex = _watchedMovies.indexWhere((m) => m.movieId == movieId);
    WatchedMovie? removed;
    if (existingIndex != -1) {
      removed = _watchedMovies.removeAt(existingIndex);
    }
    _watchedMovieIds.remove(movieId);
    notifyListeners();

    try {
      await _apiClient.delete(ApiEndpoints.watchedMovie(movieId));
    } catch (e) {
      _watchedMovieIds.add(movieId);
      if (removed != null && existingIndex != -1) {
        _watchedMovies.insert(existingIndex, removed);
      }
      notifyListeners();
      rethrow;
    }
  }
}
