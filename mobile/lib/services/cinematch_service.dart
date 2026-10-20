import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/movie.dart';

/// Response payload from a CineMatch social swiping room.
class CineMatchRoom {
  final String roomCode;
  final String hostUsername;
  final String? participantUsername;
  final String status; // WAITING, SWIPING, MATCHED
  final Movie? matchedMovie;
  final List<Movie> candidateMovies;

  const CineMatchRoom({
    required this.roomCode,
    required this.hostUsername,
    this.participantUsername,
    required this.status,
    this.matchedMovie,
    this.candidateMovies = const [],
  });

  factory CineMatchRoom.fromJson(Map<String, dynamic> json) {
    Movie? match;
    if (json['matchedMovie'] is Map) {
      match = Movie.fromJson(json['matchedMovie'] as Map<String, dynamic>);
    }

    List<Movie> queue = [];
    if (json['candidateMovies'] is List) {
      queue = (json['candidateMovies'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    } else if (json['movies'] is List) {
      queue = (json['movies'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    }

    return CineMatchRoom(
      roomCode: json['roomCode'] as String? ?? '',
      hostUsername: json['hostUsername'] as String? ?? 'Host',
      participantUsername: json['participantUsername'] as String?,
      status: json['status'] as String? ?? 'WAITING',
      matchedMovie: match,
      candidateMovies: queue,
    );
  }
}

/// Service managing CineMatch social swiping rooms.
class CineMatchService {
  final ApiClient _apiClient;

  CineMatchService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<CineMatchRoom> createRoom({String? genre, String? providers}) async {
    final response = await _apiClient.post(
      ApiEndpoints.cineMatchCreate,
      body: {
        'genre': genre ?? '',
        'providers': providers ?? '',
      },
    );
    if (response is Map<String, dynamic>) {
      return CineMatchRoom.fromJson(response);
    }
    throw Exception('Failed to create CineMatch room.');
  }

  Future<CineMatchRoom> joinRoom(String roomCode) async {
    final response = await _apiClient.post(ApiEndpoints.cineMatchJoin(roomCode.trim().toUpperCase()));
    if (response is Map<String, dynamic>) {
      return CineMatchRoom.fromJson(response);
    }
    throw Exception('Failed to join CineMatch room.');
  }

  Future<CineMatchRoom> getRoomStatus(String roomCode) async {
    final response = await _apiClient.get(ApiEndpoints.cineMatchRoom(roomCode.trim().toUpperCase()));
    if (response is Map<String, dynamic>) {
      return CineMatchRoom.fromJson(response);
    }
    throw Exception('Failed to check room status.');
  }

  Future<CineMatchRoom> startSwiping(String roomCode) async {
    final response = await _apiClient.post(ApiEndpoints.cineMatchStart(roomCode.trim().toUpperCase()));
    if (response is Map<String, dynamic>) {
      return CineMatchRoom.fromJson(response);
    }
    throw Exception('Failed to start swiping.');
  }

  Future<CineMatchRoom> swipeMovie(String roomCode, int movieId, bool isLike) async {
    final response = await _apiClient.post(
      ApiEndpoints.cineMatchSwipe(roomCode.trim().toUpperCase()),
      body: {
        'movieId': movieId,
        'isLike': isLike,
      },
    );
    if (response is Map<String, dynamic>) {
      return CineMatchRoom.fromJson(response);
    }
    throw Exception('Failed to register swipe.');
  }
}
