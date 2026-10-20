import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../models/movie.dart';
import 'rating_badge.dart';

/// Reusable Movie Poster Card matching the Cinephile "Midnight Cinema" design.
class MovieCard extends StatelessWidget {
  final Movie movie;
  final VoidCallback? onTap;
  final double width;
  final bool showRating;

  const MovieCard({
    super.key,
    required this.movie,
    this.onTap,
    this.width = 140,
    this.showRating = true,
  });

  @override
  Widget build(BuildContext context) {
    final posterUrl = movie.posterUrl;
    final posterHeight = width * 1.5; // Standard 2:3 poster aspect ratio

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Poster Frame
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: width,
                height: posterHeight,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border, width: 1),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x73000000),
                      blurRadius: 16,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (posterUrl != null)
                      Image.network(
                        posterUrl,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            color: AppColors.surface2,
                            child: const Center(
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) =>
                            _buildPosterFallback(),
                      )
                    else
                      _buildPosterFallback(),

                    // Rating badge in top-left
                    if (showRating && movie.voteAverage > 0)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: RatingBadge(rating: movie.voteAverage, compact: true),
                      ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Title
            Text(
              movie.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),

            const SizedBox(height: 2),

            // Metadata: Year
            Text(
              movie.year,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPosterFallback() {
    return Container(
      color: AppColors.surface2,
      padding: const EdgeInsets.all(12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.movie_outlined,
            size: 32,
            color: AppColors.textMuted,
          ),
          const SizedBox(height: 6),
          Text(
            movie.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
