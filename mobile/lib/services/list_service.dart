import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/movie.dart';
import '../models/movie_list.dart';

/// Service managing Custom and Public Curated Movie Lists.
class ListService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<MovieList> _myLists = [];
  List<MovieList> _publicLists = [];
  bool _isLoading = false;

  ListService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<MovieList> get myLists => _myLists;
  List<MovieList> get publicLists => _publicLists;
  bool get isLoading => _isLoading;

  /// Fetch lists created by authenticated user
  Future<List<MovieList>> fetchMyLists() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.listsMy);
      if (response is List) {
        _myLists = response
            .whereType<Map<String, dynamic>>()
            .map((item) => MovieList.fromJson(item))
            .toList();
      }
      return _myLists;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch public curated lists
  Future<List<MovieList>> fetchPublicLists() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.listsPublic);
      if (response is List) {
        _publicLists = response
            .whereType<Map<String, dynamic>>()
            .map((item) => MovieList.fromJson(item))
            .toList();
      }
      return _publicLists;
    } catch (_) {
      return [];
    }
  }

  /// Get specific list with movies
  Future<MovieList> getListById(int listId) async {
    final response = await _apiClient.get(ApiEndpoints.listDetails(listId));
    if (response is Map<String, dynamic>) {
      return MovieList.fromJson(response);
    }
    throw Exception('List not found.');
  }

  /// Create a new list
  Future<MovieList> createList({
    required String name,
    required String description,
    bool isPrivate = false,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.lists,
      body: {
        'name': name.trim(),
        'description': description.trim(),
        'isPrivate': isPrivate,
      },
    );

    if (response is Map<String, dynamic>) {
      final created = MovieList.fromJson(response);
      _myLists.insert(0, created);
      notifyListeners();
      return created;
    }
    throw Exception('Failed to create list.');
  }

  /// Delete a list
  Future<void> deleteList(int listId) async {
    await _apiClient.delete(ApiEndpoints.listDetails(listId));
    _myLists.removeWhere((l) => l.id == listId);
    notifyListeners();
  }

  /// Add a movie to a list
  Future<void> addMovieToList(int listId, Movie movie) async {
    await _apiClient.post(
      '${ApiEndpoints.lists}/$listId/movies',
      body: {
        'movieId': movie.id,
        'title': movie.title,
        'poster': movie.posterPath,
      },
    );
  }

  /// Remove a movie from a list
  Future<void> removeMovieFromList(int listId, int movieId) async {
    await _apiClient.delete(ApiEndpoints.listMovie(listId, movieId));
  }
}
