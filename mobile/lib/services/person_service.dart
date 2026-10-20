import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/person.dart';

/// Service managing People (Directors, Actors, Writers) and filmographies.
class PersonService {
  final ApiClient _apiClient;

  PersonService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Person> getPersonDetails(int personId) async {
    final response = await _apiClient.get(ApiEndpoints.tmdbPersonDetails(personId));
    if (response is Map<String, dynamic>) {
      return Person.fromJson(response);
    }
    throw Exception('Person details not found.');
  }

  Future<List<Person>> getPopularPeople({int page = 1}) async {
    final response = await _apiClient.get(
      ApiEndpoints.tmdbPopularPeople,
      queryParams: {'page': page},
    );
    if (response is Map<String, dynamic> && response['results'] is List) {
      return (response['results'] as List)
          .whereType<Map<String, dynamic>>()
          .map((p) => Person.fromJson(p))
          .toList();
    }
    return [];
  }

  Future<List<Person>> searchPeople(String query, {int page = 1}) async {
    if (query.trim().isEmpty) return [];
    final response = await _apiClient.get(
      ApiEndpoints.tmdbSearchPeople,
      queryParams: {'query': query.trim(), 'page': page},
    );
    if (response is Map<String, dynamic> && response['results'] is List) {
      return (response['results'] as List)
          .whereType<Map<String, dynamic>>()
          .map((p) => Person.fromJson(p))
          .toList();
    }
    return [];
  }
}
