import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/social_activity.dart';

/// Service managing social relationships, follower counts, and activity feeds.
class SocialService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<SocialActivity> _feed = [];
  bool _isLoading = false;

  SocialService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<SocialActivity> get feed => _feed;
  bool get isLoading => _isLoading;

  /// Fetch personalized activity feed (friends/followed users)
  Future<List<SocialActivity>> fetchPersonalizedFeed() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.socialFeed);
      if (response is List) {
        _feed = response
            .whereType<Map<String, dynamic>>()
            .map((item) => SocialActivity.fromJson(item))
            .toList();
      }
      return _feed;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch global community feed
  Future<List<SocialActivity>> fetchGlobalFeed() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.socialGlobalFeed);
      if (response is List) {
        _feed = response
            .whereType<Map<String, dynamic>>()
            .map((item) => SocialActivity.fromJson(item))
            .toList();
      }
      return _feed;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Follow a user
  Future<void> followUser(int userId) async {
    await _apiClient.post(ApiEndpoints.socialFollow(userId));
    notifyListeners();
  }

  /// Unfollow a user
  Future<void> unfollowUser(int userId) async {
    await _apiClient.delete(ApiEndpoints.socialFollow(userId));
    notifyListeners();
  }

  /// Check if current user is following target user
  Future<bool> isFollowing(int userId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.socialIsFollowing(userId));
      if (response is Map<String, dynamic>) {
        return response['isFollowing'] == true;
      }
      return response == true;
    } catch (_) {
      return false;
    }
  }

  /// Get follower and following counts
  Future<Map<String, int>> getCounts(int userId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.socialCounts(userId));
      if (response is Map<String, dynamic>) {
        return {
          'followers': (response['followers'] as num?)?.toInt() ?? 0,
          'following': (response['following'] as num?)?.toInt() ?? 0,
        };
      }
    } catch (_) {}
    return {'followers': 0, 'following': 0};
  }
}
