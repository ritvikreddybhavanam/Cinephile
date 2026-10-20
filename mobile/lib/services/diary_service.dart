import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/film_log.dart';

/// Service managing Film Diary entries and cinema statistics.
class DiaryService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<FilmLog> _diary = [];
  DiaryStats? _stats;
  bool _isLoading = false;

  DiaryService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<FilmLog> get diary => _diary;
  DiaryStats? get stats => _stats;
  bool get isLoading => _isLoading;

  /// Fetch user's complete film diary
  Future<List<FilmLog>> fetchDiary() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.diary);
      if (response is List) {
        _diary = response
            .whereType<Map<String, dynamic>>()
            .map((item) => FilmLog.fromJson(item))
            .toList();
      }
      return _diary;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch diary entries for a specific month
  Future<List<FilmLog>> fetchDiaryByMonth(int year, int month) async {
    final response = await _apiClient.get(
      ApiEndpoints.diaryMonth,
      queryParams: {'year': year, 'month': month},
    );
    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map((item) => FilmLog.fromJson(item))
          .toList();
    }
    return [];
  }

  /// Log a movie in the Film Diary
  Future<FilmLog> logFilm({
    required int movieId,
    required String title,
    int? releaseYear,
    String? posterPath,
    required DateTime watchedDate,
    double? rating,
    String? reviewText,
    bool containsSpoilers = false,
    bool isRewatch = false,
    String? loggedLocation,
    String? companionName,
  }) async {
    final payload = {
      'movieId': movieId,
      'title': title,
      'releaseYear': releaseYear,
      'posterPath': posterPath,
      'watchedDate': watchedDate.toIso8601String().split('T').first,
      'rating': rating,
      'reviewText': reviewText,
      'containsSpoilers': containsSpoilers,
      'isRewatch': isRewatch,
      'loggedLocation': loggedLocation,
      'companionName': companionName,
    };

    final response = await _apiClient.post(
      ApiEndpoints.diary,
      body: payload,
    );

    if (response is Map<String, dynamic>) {
      final logged = FilmLog.fromJson(response);
      _diary.insert(0, logged);
      notifyListeners();
      return logged;
    }
    throw Exception('Failed to log film in diary.');
  }

  /// Delete a log entry
  Future<void> deleteLog(int id) async {
    final existingIndex = _diary.indexWhere((log) => log.id == id);
    FilmLog? removed;
    if (existingIndex != -1) {
      removed = _diary.removeAt(existingIndex);
      notifyListeners();
    }

    try {
      await _apiClient.delete(ApiEndpoints.diaryEntry(id));
    } catch (e) {
      if (removed != null && existingIndex != -1) {
        _diary.insert(existingIndex, removed);
        notifyListeners();
      }
      rethrow;
    }
  }

  /// Fetch aggregate diary statistics
  Future<DiaryStats> fetchStats({int? year}) async {
    final queryParams = year != null ? {'year': year} : null;
    final response = await _apiClient.get(
      ApiEndpoints.diaryStats,
      queryParams: queryParams,
    );

    if (response is Map<String, dynamic>) {
      _stats = DiaryStats.fromJson(response);
      notifyListeners();
      return _stats!;
    }
    return const DiaryStats();
  }

  /// Fetch list of years the user has logged films
  Future<List<int>> fetchYears() async {
    final response = await _apiClient.get(ApiEndpoints.diaryYears);
    if (response is List) {
      return response.whereType<num>().map((n) => n.toInt()).toList();
    }
    return [];
  }
}
