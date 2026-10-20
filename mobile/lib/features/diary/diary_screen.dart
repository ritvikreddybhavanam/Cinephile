import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/film_log.dart';
import '../../services/diary_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/rating_badge.dart';
import 'log_film_dialog.dart';

/// Screen displaying the user's chronological Film Diary timeline, screening logs, and stats.
class DiaryScreen extends StatefulWidget {
  const DiaryScreen({super.key});

  @override
  State<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  final Set<int> _revealedSpoilers = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DiaryService>().fetchDiary();
    });
  }

  Future<void> _openLogDialog() async {
    final result = await LogFilmDialog.show(context);
    if (result == true && mounted) {
      context.read<DiaryService>().fetchDiary();
    }
  }

  Future<void> _deleteLog(FilmLog log) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        title: const Text('Delete Diary Entry?'),
        content: Text('Remove "${log.title}" from your Film Diary?'),
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
        await context.read<DiaryService>().deleteLog(log.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Deleted log for "${log.title}"')),
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
    final diaryService = context.watch<DiaryService>();
    final logs = diaryService.diary;
    final isLoading = diaryService.isLoading && logs.isEmpty;

    return Scaffold(
      appBar: CineAppBar(
        title: 'Film Diary',
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: AppColors.accent),
            tooltip: 'Log Film',
            onPressed: _openLogDialog,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openLogDialog,
        backgroundColor: AppColors.accent,
        foregroundColor: AppColors.background,
        icon: const Icon(Icons.edit_note_rounded),
        label: const Text('Log Film', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Retrieving your diary logs...')
          : logs.isEmpty
              ? CineEmptyView(
                  title: 'Your Diary is Waiting',
                  subtitle:
                      'Keep a living record of every film you watch, complete with ratings, dates, locations, and reflections.',
                  icon: Icons.auto_stories_outlined,
                  action: ElevatedButton.icon(
                    onPressed: _openLogDialog,
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Log Your First Film'),
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.accent,
                  backgroundColor: AppColors.surfaceElevated,
                  onRefresh: () => context.read<DiaryService>().fetchDiary(),
                  child: ListView(
                    padding: const EdgeInsets.only(
                      left: AppSpacing.md,
                      right: AppSpacing.md,
                      top: AppSpacing.md,
                      bottom: 80, // Space for FAB
                    ),
                    children: [
                      // Diary Summary Metrics Card
                      _buildStatsHeader(logs),
                      const SizedBox(height: 16),

                      // Timeline entries
                      ...logs.map((log) => _buildDiaryCard(context, log)),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatsHeader(List<FilmLog> logs) {
    final total = logs.length;
    final rewatches = logs.where((l) => l.isRewatch).length;
    final rated = logs.where((l) => l.rating != null && l.rating! > 0).toList();
    final avgRating = rated.isNotEmpty
        ? rated.map((l) => l.rating!).reduce((a, b) => a + b) / rated.length
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetricCol('Screenings', '$total'),
          Container(height: 36, width: 1, color: AppColors.border),
          _buildMetricCol('Avg Rating', avgRating > 0 ? avgRating.toStringAsFixed(1) : '—'),
          Container(height: 36, width: 1, color: AppColors.border),
          _buildMetricCol('Rewatches', '$rewatches'),
        ],
      ),
    );
  }

  Widget _buildMetricCol(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Georgia',
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.accent,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: AppColors.textMuted,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }

  Widget _buildDiaryCard(BuildContext context, FilmLog log) {
    final hasSpoilers = log.containsSpoilers;
    final isSpoilerRevealed = _revealedSpoilers.contains(log.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            RouteNames.movieDetails,
            arguments: log.movieId,
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Poster
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 60,
                  height: 90,
                  child: log.posterUrl != null
                      ? Image.network(
                          log.posterUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: AppColors.surfaceElevated,
                            child: const Icon(Icons.movie, color: AppColors.textMuted),
                          ),
                        )
                      : Container(
                          color: AppColors.surfaceElevated,
                          child: const Icon(Icons.movie, color: AppColors.textMuted),
                        ),
                ),
              ),
              const SizedBox(width: 14),

              // Info & Review
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top row: Title & Delete button
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            log.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: 'Georgia',
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.more_vert, size: 18, color: AppColors.textMuted),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () => _deleteLog(log),
                        ),
                      ],
                    ),

                    const SizedBox(height: 4),

                    // Date & Year & Badges
                    Row(
                      children: [
                        Text(
                          log.formattedWatchedDate,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accent,
                          ),
                        ),
                        if (log.releaseYear != null) ...[
                          const SizedBox(width: 6),
                          Text(
                            '(${log.releaseYear})',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                        if (log.isRewatch) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.repeat_rounded, size: 11, color: AppColors.accent),
                                SizedBox(width: 2),
                                Text(
                                  'Rewatch',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.accent,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),

                    // Rating
                    if (log.rating != null && log.rating! > 0) ...[
                      const SizedBox(height: 6),
                      RatingBadge(rating: log.rating!),
                    ],

                    // Screening Location / Companion tags
                    if (log.loggedLocation != null || log.companionName != null) ...[
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          if (log.loggedLocation != null)
                            _buildInfoTag(Icons.place_outlined, log.loggedLocation!),
                          if (log.companionName != null)
                            _buildInfoTag(Icons.person_outline, 'w/ ${log.companionName!}'),
                        ],
                      ),
                    ],

                    // Review snippet / Spoilers
                    if (log.reviewText != null && log.reviewText!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      if (hasSpoilers && !isSpoilerRevealed)
                        GestureDetector(
                          onTap: () {
                            setState(() => _revealedSpoilers.add(log.id));
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.warning_amber_rounded, size: 14, color: AppColors.warning),
                                SizedBox(width: 6),
                                Text(
                                  'Contains Spoilers (Tap to reveal)',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        Text(
                          log.reviewText!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                            height: 1.3,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTag(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: AppColors.border, width: 0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: AppColors.textMuted),
          const SizedBox(width: 3),
          Text(
            text,
            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
