import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../models/movie.dart';
import 'movie_card.dart';

/// Horizontally scrollable shelf of movies with section title and optional action.
class MovieHorizontalList extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Movie> movies;
  final ValueChanged<Movie>? onMovieTap;
  final VoidCallback? onSeeAllTap;
  final double cardWidth;

  const MovieHorizontalList({
    super.key,
    required this.title,
    this.subtitle,
    required this.movies,
    this.onMovieTap,
    this.onSeeAllTap,
    this.cardWidth = 130,
  });

  @override
  Widget build(BuildContext context) {
    if (movies.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontFamily: 'Georgia',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (onSeeAllTap != null)
                GestureDetector(
                  onTap: onSeeAllTap,
                  child: const Padding(
                    padding: EdgeInsets.only(left: 8, bottom: 2),
                    child: Text(
                      'See all',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.accent,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Horizontal List
        SizedBox(
          height: (cardWidth * 1.5) + 52, // Poster height + title + padding
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: movies.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final movie = movies[index];
              return MovieCard(
                movie: movie,
                width: cardWidth,
                onTap: () => onMovieTap?.call(movie),
              );
            },
          ),
        ),
      ],
    );
  }
}
