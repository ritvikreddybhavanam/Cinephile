import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/review.dart';

/// Service managing Cinephile community reviews, comments, and review likes.
class ReviewService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<Review> _myReviews = [];
  bool _isLoading = false;

  ReviewService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<Review> get myReviews => _myReviews;
  bool get isLoading => _isLoading;

  /// Fetch all reviews written by current user
  Future<List<Review>> fetchMyReviews() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.reviewsMy);
      if (response is List) {
        _myReviews = response
            .whereType<Map<String, dynamic>>()
            .map((item) => Review.fromJson(item))
            .toList();
      }
      return _myReviews;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch reviews for a specific movie
  Future<List<Review>> fetchMovieReviews(int movieId) async {
    final response = await _apiClient.get(ApiEndpoints.reviewsByMovie(movieId));
    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map((item) => Review.fromJson(item))
          .toList();
    }
    return [];
  }

  /// Create a new film review
  Future<Review> createReview({
    required int movieId,
    required String movieTitle,
    String? moviePoster,
    int? movieReleaseYear,
    required double rating,
    required String reviewText,
    bool containsSpoilers = false,
    ReviewIntent intent = ReviewIntent.generalCritique,
  }) async {
    final payload = {
      'movieId': movieId,
      'movieTitle': movieTitle,
      'moviePoster': moviePoster,
      'movieReleaseYear': movieReleaseYear,
      'rating': rating,
      'reviewText': reviewText,
      'containsSpoilers': containsSpoilers,
      'intentCategory': intent.label,
    };

    final response = await _apiClient.post(
      ApiEndpoints.reviews,
      body: payload,
    );

    if (response is Map<String, dynamic>) {
      final review = Review.fromJson(response);
      _myReviews.insert(0, review);
      notifyListeners();
      return review;
    }
    throw Exception('Failed to post review.');
  }

  /// Delete a review
  Future<void> deleteReview(int reviewId) async {
    final existingIndex = _myReviews.indexWhere((r) => r.id == reviewId);
    Review? removed;
    if (existingIndex != -1) {
      removed = _myReviews.removeAt(existingIndex);
      notifyListeners();
    }

    try {
      await _apiClient.delete(ApiEndpoints.reviewDetails(reviewId));
    } catch (e) {
      if (removed != null && existingIndex != -1) {
        _myReviews.insert(existingIndex, removed);
        notifyListeners();
      }
      rethrow;
    }
  }

  /// Toggle like on a review
  Future<void> toggleLike(int reviewId) async {
    await _apiClient.post(ApiEndpoints.reviewLikes(reviewId));
  }

  /// Fetch comments for a review
  Future<List<ReviewComment>> fetchComments(int reviewId) async {
    final response = await _apiClient.get(ApiEndpoints.reviewComments(reviewId));
    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map((item) => ReviewComment.fromJson(item))
          .toList();
    }
    return [];
  }

  /// Add comment to a review
  Future<ReviewComment> addComment(int reviewId, String content, {int? parentId}) async {
    final response = await _apiClient.post(
      ApiEndpoints.reviewComments(reviewId),
      body: {
        'content': content.trim(),
        'parentId': parentId,
      },
    );

    if (response is Map<String, dynamic>) {
      return ReviewComment.fromJson(response);
    }
    throw Exception('Failed to add comment.');
  }
}
