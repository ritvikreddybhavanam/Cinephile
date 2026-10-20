import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/liked_movie.dart';
import '../models/movie.dart';
import '../models/movie_detail.dart';

/// Service managing user's Favorite / Liked movies with persistent backend sync.
class FavoriteService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<LikedMovie> _favorites = [];
  final Set<int> _likedMovieIds = {};
  bool _isLoading = false;

  FavoriteService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<LikedMovie> get favorites => _favorites;
  bool get isLoading => _isLoading;

  bool isLiked(int movieId) => _likedMovieIds.contains(movieId);

  /// Fetch user's favorite movies
  Future<List<LikedMovie>> fetchFavorites() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.likedMovies);
      if (response is List) {
        _favorites = response
            .whereType<Map<String, dynamic>>()
            .map((item) => LikedMovie.fromJson(item))
            .toList();
        _likedMovieIds.clear();
        for (final fav in _favorites) {
          _likedMovieIds.add(fav.movieId);
        }
      }
      return _favorites;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Check like status for a single movie from backend
  Future<bool> checkStatus(int movieId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.likedMovieStatus(movieId));
      final bool liked = response == true || response == 'true';
      if (liked) {
        _likedMovieIds.add(movieId);
      } else {
        _likedMovieIds.remove(movieId);
      }
      notifyListeners();
      return liked;
    } catch (_) {
      return isLiked(movieId);
    }
  }

  /// Like a movie with optimistic update
  Future<void> likeMovie(dynamic movie) async {
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

    if (isLiked(movieId)) return;

    // Optimistic update
    _likedMovieIds.add(movieId);
    final temp = LikedMovie(
      id: DateTime.now().millisecondsSinceEpoch,
      movieId: movieId,
      title: title,
      posterPath: poster,
      rating: 0.0,
      likedAt: DateTime.now(),
    );
    _favorites.insert(0, temp);
    notifyListeners();

    try {
      await _apiClient.post(ApiEndpoints.likedMovie(movieId));
    } catch (e) {
      // Rollback
      _likedMovieIds.remove(movieId);
      _favorites.removeWhere((item) => item.movieId == movieId);
      notifyListeners();
      rethrow;
    }
  }

  /// Unlike a movie with optimistic update
  Future<void> unlikeMovie(int movieId) async {
    if (!isLiked(movieId)) return;

    final existingIndex = _favorites.indexWhere((item) => item.movieId == movieId);
    LikedMovie? removedItem;
    if (existingIndex != -1) {
      removedItem = _favorites.removeAt(existingIndex);
    }
    _likedMovieIds.remove(movieId);
    notifyListeners();

    try {
      await _apiClient.delete(ApiEndpoints.likedMovie(movieId));
    } catch (e) {
      // Rollback
      _likedMovieIds.add(movieId);
      if (removedItem != null && existingIndex != -1) {
        _favorites.insert(existingIndex, removedItem);
      }
      notifyListeners();
      rethrow;
    }
  }

  /// Toggle like state
  Future<bool> toggleLike(dynamic movie) async {
    final int movieId = movie is Movie
        ? movie.id
        : (movie is MovieDetail ? movie.id : (movie['id'] as num).toInt());

    if (isLiked(movieId)) {
      await unlikeMovie(movieId);
      return false;
    } else {
      await likeMovie(movie);
      return true;
    }
  }
}
