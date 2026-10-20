import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/user_profile.dart';

/// Service managing user profile data and profile editing.
class UserService extends ChangeNotifier {
  final ApiClient _apiClient;
  UserProfile? _profile;
  bool _isLoading = false;

  UserService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;

  /// Fetch currently authenticated user's profile
  Future<UserProfile?> fetchMyProfile() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.userProfile);
      if (response is Map<String, dynamic>) {
        _profile = UserProfile.fromJson(response);
      }
      return _profile;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update user profile
  Future<UserProfile> updateProfile({
    String? firstname,
    String? lastname,
    String? username,
    String? bio,
    String? location,
    String? website,
    List<String>? favoriteGenres,
    String? avatarUrl,
  }) async {
    final payload = <String, dynamic>{};
    if (firstname != null) payload['firstname'] = firstname.trim();
    if (lastname != null) payload['lastname'] = lastname.trim();
    if (username != null) payload['username'] = username.trim();
    if (bio != null) payload['bio'] = bio.trim();
    if (location != null) payload['location'] = location.trim();
    if (website != null) payload['website'] = website.trim();
    if (favoriteGenres != null) payload['favoriteGenres'] = favoriteGenres;
    if (avatarUrl != null) payload['avatarUrl'] = avatarUrl.trim();

    final response = await _apiClient.put(
      ApiEndpoints.userProfile,
      body: payload,
    );

    if (response is Map<String, dynamic>) {
      _profile = UserProfile.fromJson(response);
      notifyListeners();
      return _profile!;
    }
    throw Exception('Failed to update profile.');
  }

  /// Get public profile of another user
  Future<UserProfile> getPublicProfile(int userId) async {
    final response = await _apiClient.get(ApiEndpoints.userPublicProfile(userId));
    if (response is Map<String, dynamic>) {
      return UserProfile.fromJson(response);
    }
    throw Exception('User profile not found.');
  }
}
