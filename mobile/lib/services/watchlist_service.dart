import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/movie.dart';
import '../models/movie_detail.dart';
import '../models/watchlist_item.dart';

/// Service managing the user's Watchlist with persistent backend synchronization.
class WatchlistService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<WatchlistItem> _watchlist = [];
  bool _isLoading = false;

  WatchlistService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<WatchlistItem> get watchlist => _watchlist;
  bool get isLoading => _isLoading;

  /// Check if a movie is in the local cached watchlist
  bool isInWatchlist(int movieId) {
    return _watchlist.any((item) => item.movieId == movieId);
  }

  /// Fetch user's watchlist from backend
  Future<List<WatchlistItem>> fetchWatchlist() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.watchlist);
      if (response is List) {
        _watchlist = response
            .whereType<Map<String, dynamic>>()
            .map((item) => WatchlistItem.fromJson(item))
            .toList();
      }
      return _watchlist;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Add movie to watchlist with optimistic update
  Future<void> addToWatchlist(dynamic movie) async {
    int movieId = 0;
    String title = '';
    String? poster;

    if (movie is Movie) {
      movieId = movie.id;
      title = movie.title;
      poster = movie.posterPath;
    } else if (movie is MovieDetail) {
      movieId = movie.id;
      title = movie.title;
      poster = movie.posterPath;
    } else if (movie is Map<String, dynamic>) {
      movieId = (movie['id'] as num?)?.toInt() ?? 0;
      title = movie['title'] as String? ?? 'Untitled';
      poster = movie['poster_path'] as String? ?? movie['poster'] as String?;
    }

    if (isInWatchlist(movieId)) return;

    // Optimistic add
    final tempItem = WatchlistItem(
      id: DateTime.now().millisecondsSinceEpoch,
      movieId: movieId,
      title: title,
      poster: poster,
      addedAt: DateTime.now(),
    );
    _watchlist.insert(0, tempItem);
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiEndpoints.watchlist,
        body: {
          'movieId': movieId,
          'title': title,
          'poster': poster,
        },
      );
      if (response is Map<String, dynamic>) {
        final realItem = WatchlistItem.fromJson(response);
        final index = _watchlist.indexWhere((i) => i.movieId == movieId);
        if (index != -1) {
          _watchlist[index] = realItem;
        }
      }
    } catch (e) {
      // Rollback on failure
      _watchlist.removeWhere((item) => item.movieId == movieId);
      notifyListeners();
      rethrow;
    }
  }

  /// Remove movie from watchlist with optimistic update
  Future<void> removeFromWatchlist(int movieId) async {
    final existingIndex = _watchlist.indexWhere((item) => item.movieId == movieId);
    if (existingIndex == -1) return;

    final removedItem = _watchlist.removeAt(existingIndex);
    notifyListeners();

    try {
      await _apiClient.delete(ApiEndpoints.watchlistMovie(movieId));
    } catch (e) {
      // Rollback
      _watchlist.insert(existingIndex, removedItem);
      notifyListeners();
      rethrow;
    }
  }

  /// Toggle watchlist state
  Future<bool> toggleWatchlist(dynamic movie) async {
    final int movieId = movie is Movie
        ? movie.id
        : (movie is MovieDetail ? movie.id : (movie['id'] as num).toInt());

    if (isInWatchlist(movieId)) {
      await removeFromWatchlist(movieId);
      return false;
    } else {
      await addToWatchlist(movie);
      return true;
    }
  }
}
