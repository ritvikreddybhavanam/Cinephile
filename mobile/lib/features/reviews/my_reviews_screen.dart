import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/review.dart';
import '../../services/review_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/rating_badge.dart';

/// Screen displaying all reviews published by the current user with edit/delete controls.
class MyReviewsScreen extends StatefulWidget {
  const MyReviewsScreen({super.key});

  @override
  State<MyReviewsScreen> createState() => _MyReviewsScreenState();
}

class _MyReviewsScreenState extends State<MyReviewsScreen> {
  final Set<int> _revealedSpoilers = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReviewService>().fetchMyReviews();
    });
  }

  Future<void> _deleteReview(Review review) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        title: const Text('Delete Review?'),
        content: Text('Delete your review for "${review.movieTitle}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      try {
        await context.read<ReviewService>().deleteReview(review.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Deleted review for "${review.movieTitle}"')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final reviewService = context.watch<ReviewService>();
    final reviews = reviewService.myReviews;
    final isLoading = reviewService.isLoading && reviews.isEmpty;

    return Scaffold(
      appBar: const CineAppBar(title: 'My Reviews'),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Loading your critiques...')
          : reviews.isEmpty
              ? CineEmptyView(
                  title: 'No Reviews Written Yet',
                  subtitle:
                      'Share your critical insights with the Cinephile community. Write reviews from any film page.',
                  icon: Icons.rate_review_outlined,
                  action: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed(RouteNames.discover);
                    },
                    child: const Text('Discover Films to Review'),
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.accent,
                  backgroundColor: AppColors.surfaceElevated,
                  onRefresh: () => context.read<ReviewService>().fetchMyReviews(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: reviews.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = reviews[index];
                      return _buildReviewCard(context, item);
                    },
                  ),
                ),
    );
  }

  Widget _buildReviewCard(BuildContext context, Review review) {
    final isSpoilerRevealed = _revealedSpoilers.contains(review.id);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Movie Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (review.moviePoster != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.network(
                    review.posterUrl!,
                    width: 44,
                    height: 66,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 44,
                      height: 66,
                      color: AppColors.surfaceElevated,
                      child: const Icon(Icons.movie, size: 20),
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pushNamed(
                          RouteNames.movieDetails,
                          arguments: review.movieId,
                        );
                      },
                      child: Text(
                        review.movieTitle,
                        style: const TextStyle(
                          fontFamily: 'Georgia',
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        RatingBadge(rating: review.rating),
                        const SizedBox(width: 8),
                        Text(
                          review.createdAt != null ? _formatDate(review.createdAt!) : '',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded,
                    color: AppColors.error, size: 20),
                tooltip: 'Delete Review',
                onPressed: () => _deleteReview(review),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Intent category pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.border, width: 0.8),
            ),
            child: Text(
              review.intentCategory,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: AppColors.accent,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Review Body Text
          if (review.containsSpoilers && !isSpoilerRevealed)
            GestureDetector(
              onTap: () {
                setState(() => _revealedSpoilers.add(review.id));
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, size: 16, color: AppColors.warning),
                    const SizedBox(width: 8),
                    const Text(
                      'Review contains spoilers. Tap to reveal.',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Text(
              review.reviewText,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.45,
              ),
            ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
