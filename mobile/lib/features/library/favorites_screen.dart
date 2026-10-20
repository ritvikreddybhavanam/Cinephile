import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/liked_movie.dart';
import '../../services/favorite_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/rating_badge.dart';

/// Screen displaying the user's favorite / liked movies with responsive grid and live sync.
class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FavoriteService>().fetchFavorites();
    });
  }

  Future<void> _unlikeMovie(LikedMovie movie) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      await context.read<FavoriteService>().unlikeMovie(movie.movieId);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Removed "${movie.title}" from favorites'),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed to update favorites: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final favoriteService = context.watch<FavoriteService>();
    final favorites = favoriteService.favorites;
    final isLoading = favoriteService.isLoading && favorites.isEmpty;

    return Scaffold(
      appBar: const CineAppBar(title: 'Favorite Films'),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Loading favorites...')
          : favorites.isEmpty
              ? CineEmptyView(
                  title: 'No Favorites Yet',
                  subtitle:
                      'Tap the heart icon on any film details page to curate your personal hall of fame.',
                  icon: Icons.favorite_border_rounded,
                  action: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed(RouteNames.discover);
                    },
                    child: const Text('Discover Films'),
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.accent,
                  backgroundColor: AppColors.surfaceElevated,
                  onRefresh: () => context.read<FavoriteService>().fetchFavorites(),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final crossAxisCount = constraints.maxWidth > 900
                          ? 5
                          : constraints.maxWidth > 600
                              ? 3
                              : 2;

                      return GridView.builder(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        physics: const AlwaysScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          childAspectRatio: 0.62,
                          crossAxisSpacing: AppSpacing.sm,
                          mainAxisSpacing: AppSpacing.md,
                        ),
                        itemCount: favorites.length,
                        itemBuilder: (context, index) {
                          final item = favorites[index];
                          return _buildFavoriteCard(context, item);
                        },
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildFavoriteCard(BuildContext context, LikedMovie item) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pushNamed(
          RouteNames.movieDetails,
          arguments: item.movieId,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (item.posterUrl != null)
                    Image.network(
                      item.posterUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.surfaceElevated,
                        child: const Icon(
                          Icons.movie_outlined,
                          color: AppColors.textMuted,
                          size: 32,
                        ),
                      ),
                    )
                  else
                    Container(
                      color: AppColors.surfaceElevated,
                      child: const Icon(
                        Icons.movie_outlined,
                        color: AppColors.textMuted,
                        size: 32,
                      ),
                    ),
                  // Rating Badge
                  if (item.rating > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: RatingBadge(rating: item.rating),
                    ),
                  // Unlike button
                  Positioned(
                    top: 8,
                    left: 8,
                    child: GestureDetector(
                      onTap: () => _unlikeMovie(item),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.favorite_rounded,
                          color: AppColors.favorite,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.likedAt != null
                        ? 'Added ${_formatDate(item.likedAt!)}'
                        : 'Added recently',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
