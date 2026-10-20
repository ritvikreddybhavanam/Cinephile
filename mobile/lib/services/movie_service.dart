import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/content_advisory.dart';
import '../models/credit.dart';
import '../models/genre.dart';
import '../models/movie.dart';
import '../models/movie_detail.dart';
import '../models/video.dart';
import '../models/watch_provider.dart';

/// Service managing all movie discovery, search, streaming, and TMDB catalog operations.
class MovieService {
  final ApiClient _apiClient;

  MovieService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetch trending movies of the week/day
  Future<List<Movie>> getTrending({int page = 1}) async {
    final response = await _apiClient.get(
      ApiEndpoints.tmdbTrending,
      queryParams: {'page': page},
    );
    return _parseMovieList(response);
  }

  /// Fetch top popular movies
  Future<List<Movie>> getPopular({int page = 1}) async {
    final response = await _apiClient.get(
      ApiEndpoints.tmdbPopular,
      queryParams: {'page': page},
    );
    return _parseMovieList(response);
  }

  /// Discover movies with flexible sorting and filtering
  Future<List<Movie>> getMovies({
    int page = 1,
    String sortBy = 'popularity.desc',
    int? genreId,
    String? language,
    String? year,
    String? ratingGte,
    String? withWatchProviders,
    String? watchRegion,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'sortBy': sortBy,
    };

    if (genreId != null && genreId > 0) {
      queryParams['genre'] = genreId.toString();
    }
    if (language != null && language.isNotEmpty) {
      queryParams['language'] = language;
    }
    if (year != null && year.isNotEmpty) {
      queryParams['year'] = year;
    }
    if (ratingGte != null && ratingGte.isNotEmpty) {
      queryParams['rating'] = ratingGte;
    }
    if (withWatchProviders != null && withWatchProviders.isNotEmpty) {
      queryParams['withWatchProviders'] = withWatchProviders;
    }
    if (watchRegion != null && watchRegion.isNotEmpty) {
      queryParams['watchRegion'] = watchRegion;
    }

    final response = await _apiClient.get(
      ApiEndpoints.tmdbMovies,
      queryParams: queryParams,
    );
    return _parseMovieList(response);
  }

  /// Get new releases sorted by release date
  Future<List<Movie>> getNewReleases({int page = 1, int? genreId, String? language}) async {
    return getMovies(
      page: page,
      sortBy: 'primary_release_date.desc',
      genreId: genreId,
      language: language,
    );
  }

  /// Search movies by keyword
  Future<List<Movie>> searchMovies(String query, {int page = 1}) async {
    if (query.trim().isEmpty) return [];

    final response = await _apiClient.get(
      ApiEndpoints.tmdbSearch,
      queryParams: {
        'query': query.trim(),
        'page': page,
      },
    );
    return _parseMovieList(response);
  }

  /// Get comprehensive movie details
  Future<MovieDetail> getMovieDetails(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbMovieDetails(movieId));
    if (response is Map<String, dynamic>) {
      return MovieDetail.fromJson(response);
    }
    throw Exception('Invalid movie details format received from server.');
  }

  /// Get movie cast and crew
  Future<MovieCredits> getMovieCredits(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbMovieCredits(movieId));
    if (response is Map<String, dynamic>) {
      return MovieCredits.fromJson(response);
    }
    return const MovieCredits();
  }

  /// Get movie trailers and videos
  Future<List<VideoTrailer>> getMovieVideos(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbMovieVideos(movieId));
    if (response is Map<String, dynamic> && response['results'] is List) {
      return (response['results'] as List)
          .whereType<Map<String, dynamic>>()
          .map((v) => VideoTrailer.fromJson(v))
          .toList();
    }
    return [];
  }

  /// Get streaming watch providers for a movie
  Future<MovieWatchProviders> getMovieWatchProviders(int movieId, {String region = 'IN'}) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.tmdbMovieWatchProviders(movieId));
      if (response is Map<String, dynamic> && response['results'] is Map) {
        final results = response['results'] as Map<String, dynamic>;
        final regionData = results[region] ?? results['US'] ?? (results.isNotEmpty ? results.values.first : null);
        if (regionData is Map<String, dynamic>) {
          return MovieWatchProviders.fromTmdbRegionJson(regionData);
        }
      }
    } catch (_) {}
    return const MovieWatchProviders();
  }

  /// Get list of available streaming watch providers in a region
  Future<List<WatchProvider>> getAllWatchProviders({String region = 'IN'}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.tmdbWatchProviders,
        queryParams: {'watchRegion': region},
      );
      if (response is Map<String, dynamic> && response['results'] is List) {
        return (response['results'] as List)
            .whereType<Map<String, dynamic>>()
            .map((p) => WatchProvider.fromJson(p))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  /// Get movie recommendations
  Future<List<Movie>> getRecommendations(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbMovieRecommendations(movieId));
    return _parseMovieList(response);
  }

  /// Get similar movies
  Future<List<Movie>> getSimilar(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbMovieSimilar(movieId));
    return _parseMovieList(response);
  }

  /// Get list of movie genres
  Future<List<Genre>> getGenres() async {
    final response = await _apiClient.get(ApiEndpoints.tmdbGenres);
    if (response is Map<String, dynamic> && response['genres'] is List) {
      return (response['genres'] as List)
          .whereType<Map<String, dynamic>>()
          .map((g) => Genre.fromJson(g))
          .toList();
    }
    return [];
  }

  /// Get supported ISO languages
  Future<List<Map<String, dynamic>>> getLanguages() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.tmdbLanguages);
      if (response is List) {
        return response.whereType<Map<String, dynamic>>().toList();
      }
    } catch (_) {}
    return [
      {'iso_639_1': 'en', 'english_name': 'English', 'name': 'English'},
      {'iso_639_1': 'hi', 'english_name': 'Hindi', 'name': 'हिन्दी'},
      {'iso_639_1': 'es', 'english_name': 'Spanish', 'name': 'Español'},
      {'iso_639_1': 'fr', 'english_name': 'French', 'name': 'Français'},
      {'iso_639_1': 'ja', 'english_name': 'Japanese', 'name': '日本語'},
      {'iso_639_1': 'ko', 'english_name': 'Korean', 'name': '한국어'},
      {'iso_639_1': 'ta', 'english_name': 'Tamil', 'name': 'தமிழ்'},
      {'iso_639_1': 'te', 'english_name': 'Telugu', 'name': 'తెలుగు'},
    ];
  }

  /// Get top movies in a language
  Future<List<Movie>> getTopMoviesByLanguage(String language) async {
    final response = await _apiClient.get(
      ApiEndpoints.tmdbTopMovies,
      queryParams: {'language': language},
    );
    return _parseMovieList(response);
  }

  /// Fetch content advisory and warnings for a movie
  Future<List<ContentAdvisory>> getContentAdvisories(int movieId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.contentGuide(movieId));
      if (response is List) {
        return response
            .whereType<Map<String, dynamic>>()
            .map((item) => ContentAdvisory.fromJson(item))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  List<Movie> _parseMovieList(dynamic response) {
    if (response is Map<String, dynamic> && response['results'] is List) {
      return (response['results'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    } else if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    }
    return [];
  }
}
