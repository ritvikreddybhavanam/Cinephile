import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../services/diary_service.dart';
import '../../services/favorite_service.dart';
import '../../services/watched_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying deep cinematic analytics, ratings histogram, and Cinephile Wrapped stats.
class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    await Future.wait([
      context.read<DiaryService>().fetchDiary(),
      context.read<WatchedService>().fetchWatchedMovies(),
      context.read<FavoriteService>().fetchFavorites(),
    ]);
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: CineAppBar(title: 'Cinematic Analytics'),
        body: CineLoadingIndicator(message: 'Calculating film analytics...'),
      );
    }

    final diaryLogs = context.watch<DiaryService>().diary;
    final watchedMovies = context.watch<WatchedService>().watchedMovies;
    final favorites = context.watch<FavoriteService>().favorites;

    final totalFilms = (diaryLogs.length > watchedMovies.length)
        ? diaryLogs.length
        : watchedMovies.length;
    final estimatedHours = (totalFilms * 115) ~/ 60; // 115 min average per film
    final rewatches = diaryLogs.where((l) => l.isRewatch).length;

    // Ratings distribution
    final ratings = <int, int>{}; // 1 to 5 stars
    for (int i = 1; i <= 5; i++) {
      ratings[i] = 0;
    }
    for (final log in diaryLogs) {
      if (log.rating != null && log.rating! > 0) {
        final rounded = log.rating!.round().clamp(1, 5);
        ratings[rounded] = (ratings[rounded] ?? 0) + 1;
      }
    }
    for (final w in watchedMovies) {
      if (w.rating != null && w.rating! > 0) {
        final rounded = w.rating!.round().clamp(1, 5);
        ratings[rounded] = (ratings[rounded] ?? 0) + 1;
      }
    }

    final maxRatingCount = ratings.values.fold<int>(0, (max, val) => val > max ? val : max);

    // Venues / Services breakdown
    final venueCounts = <String, int>{};
    for (final log in diaryLogs) {
      if (log.loggedLocation != null && log.loggedLocation!.isNotEmpty) {
        final loc = log.loggedLocation!;
        venueCounts[loc] = (venueCounts[loc] ?? 0) + 1;
      }
    }
    for (final w in watchedMovies) {
      if (w.service != null && w.service!.isNotEmpty) {
        final s = w.service!;
        venueCounts[s] = (venueCounts[s] ?? 0) + 1;
      }
    }

    return Scaffold(
      appBar: const CineAppBar(title: 'Cinematic Analytics'),
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.surfaceElevated,
        onRefresh: _loadStats,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cinephile Wrapped Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.surface2, AppColors.surface],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.accent.withValues(alpha: 0.3),
                    width: 1.2,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.auto_awesome_rounded,
                            color: AppColors.accent,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'CINEPHILE INSIGHTS',
                          style: TextStyle(
                            fontFamily: 'Georgia',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.accent,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '$totalFilms',
                      style: const TextStyle(
                        fontFamily: 'Georgia',
                        fontSize: 44,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Total Screenings Logged',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        _buildHeroStat('~$estimatedHours hrs', 'Watch Time'),
                        const SizedBox(width: 24),
                        _buildHeroStat('$rewatches', 'Rewatches'),
                        const SizedBox(width: 24),
                        _buildHeroStat('${favorites.length}', 'Favorites'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Ratings Histogram Section
              const Text(
                'Ratings Distribution',
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Frequency of star ratings across your viewing logs',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),

              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: List.generate(5, (index) {
                    final stars = 5 - index; // 5 down to 1
                    final count = ratings[stars] ?? 0;
                    final ratio = maxRatingCount > 0 ? count / maxRatingCount : 0.0;

                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 50,
                            child: Row(
                              children: [
                                Text(
                                  '$stars',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.star,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(Icons.star_rounded, size: 14, color: AppColors.star),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Stack(
                              children: [
                                Container(
                                  height: 18,
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceElevated,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                                FractionallySizedBox(
                                  widthFactor: ratio.clamp(0.02, 1.0),
                                  child: Container(
                                    height: 18,
                                    decoration: BoxDecoration(
                                      color: count > 0 ? AppColors.accent : Colors.transparent,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          SizedBox(
                            width: 32,
                            child: Text(
                              '$count',
                              textAlign: TextAlign.end,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),

              const SizedBox(height: 28),

              // Top Venues / Platforms
              if (venueCounts.isNotEmpty) ...[
                const Text(
                  'Top Venues & Streaming Platforms',
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Where you experience cinema most frequently',
                  style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: venueCounts.entries.map((entry) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.theaters_outlined, size: 14, color: AppColors.accent),
                          const SizedBox(width: 8),
                          Text(
                            entry.key,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${entry.value}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accent,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.accent,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}
