import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/watchlist_item.dart';
import '../../services/watched_service.dart';
import '../../services/watchlist_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

enum WatchlistSort { newest, oldest, alphabetical }

/// Screen displaying the user's Watchlist with sorting, search filtering, and quick actions.
class WatchlistScreen extends StatefulWidget {
  const WatchlistScreen({super.key});

  @override
  State<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends State<WatchlistScreen> {
  WatchlistSort _sortOrder = WatchlistSort.newest;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WatchlistService>().fetchWatchlist();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _removeFromWatchlist(WatchlistItem item) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      await context.read<WatchlistService>().removeFromWatchlist(item.movieId);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Removed "${item.title}" from watchlist'),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _markAsWatched(WatchlistItem item) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      await context.read<WatchedService>().markAsWatched(item);
      if (mounted) {
        await context.read<WatchlistService>().removeFromWatchlist(item.movieId);
      }
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Marked "${item.title}" as watched!'),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.accent,
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Error marking watched: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  List<WatchlistItem> _filterAndSort(List<WatchlistItem> items) {
    var filtered = items.where((item) {
      if (_searchQuery.isEmpty) return true;
      return item.title.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    switch (_sortOrder) {
      case WatchlistSort.newest:
        filtered.sort((a, b) =>
            (b.addedAt ?? DateTime(0)).compareTo(a.addedAt ?? DateTime(0)));
        break;
      case WatchlistSort.oldest:
        filtered.sort((a, b) =>
            (a.addedAt ?? DateTime(0)).compareTo(b.addedAt ?? DateTime(0)));
        break;
      case WatchlistSort.alphabetical:
        filtered.sort((a, b) => a.title.compareTo(b.title));
        break;
    }
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final watchlistService = context.watch<WatchlistService>();
    final rawItems = watchlistService.watchlist;
    final items = _filterAndSort(rawItems);
    final isLoading = watchlistService.isLoading && rawItems.isEmpty;

    return Scaffold(
      appBar: CineAppBar(
        title: 'Watchlist',
        actions: [
          PopupMenuButton<WatchlistSort>(
            icon: const Icon(Icons.sort_rounded, color: AppColors.textPrimary),
            tooltip: 'Sort By',
            initialValue: _sortOrder,
            onSelected: (val) => setState(() => _sortOrder = val),
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: WatchlistSort.newest,
                child: Text('Date Added (Newest)'),
              ),
              const PopupMenuItem(
                value: WatchlistSort.oldest,
                child: Text('Date Added (Oldest)'),
              ),
              const PopupMenuItem(
                value: WatchlistSort.alphabetical,
                child: Text('Title (A-Z)'),
              ),
            ],
          ),
        ],
      ),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Loading watchlist...')
          : rawItems.isEmpty
              ? CineEmptyView(
                  title: 'Your Watchlist is Empty',
                  subtitle:
                      'Queue films you want to see. Tap "Add to Watchlist" on any title.',
                  icon: Icons.bookmark_border_rounded,
                  action: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed(RouteNames.discover);
                    },
                    child: const Text('Explore Movies'),
                  ),
                )
              : Column(
                  children: [
                    // Filter bar
                    if (rawItems.length > 5)
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Filter ${rawItems.length} queued films...',
                            prefixIcon: const Icon(Icons.search, size: 20),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: 10,
                            ),
                          ),
                          onChanged: (val) => setState(() => _searchQuery = val),
                        ),
                      ),

                    // Count header
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: 6,
                      ),
                      child: Row(
                        children: [
                          Text(
                            '${items.length} ${items.length == 1 ? 'Film' : 'Films'} Queued',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            _sortOrder == WatchlistSort.newest
                                ? 'Sorted: Newest'
                                : _sortOrder == WatchlistSort.oldest
                                    ? 'Sorted: Oldest'
                                    : 'Sorted: A-Z',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.accent,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Grid or List of items
                    Expanded(
                      child: RefreshIndicator(
                        color: AppColors.accent,
                        backgroundColor: AppColors.surfaceElevated,
                        onRefresh: () =>
                            context.read<WatchlistService>().fetchWatchlist(),
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
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                childAspectRatio: 0.58,
                                crossAxisSpacing: AppSpacing.sm,
                                mainAxisSpacing: AppSpacing.md,
                              ),
                              itemCount: items.length,
                              itemBuilder: (context, index) {
                                final item = items[index];
                                return _buildWatchlistCard(context, item);
                              },
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildWatchlistCard(BuildContext context, WatchlistItem item) {
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

                  // Quick remove button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => _removeFromWatchlist(item),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.bookmark_remove_rounded,
                          color: AppColors.error,
                          size: 16,
                        ),
                      ),
                    ),
                  ),

                  // Mark as Watched quick button
                  Positioned(
                    top: 8,
                    left: 8,
                    child: GestureDetector(
                      onTap: () => _markAsWatched(item),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check_circle_outline_rounded,
                          color: AppColors.accent,
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
                    item.addedAt != null
                        ? 'Queued ${_formatDate(item.addedAt!)}'
                        : 'Queued',
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
