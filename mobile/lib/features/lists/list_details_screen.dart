import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie_list.dart';
import '../../models/watchlist_item.dart';
import '../../services/list_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying the movies inside a curated list with management controls.
class ListDetailsScreen extends StatefulWidget {
  final dynamic listOrId; // MovieList or int listId

  const ListDetailsScreen({super.key, required this.listOrId});

  @override
  State<ListDetailsScreen> createState() => _ListDetailsScreenState();
}

class _ListDetailsScreenState extends State<ListDetailsScreen> {
  MovieList? _list;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadListDetails();
  }

  int get _listId {
    if (widget.listOrId is MovieList) {
      return (widget.listOrId as MovieList).id;
    } else if (widget.listOrId is int) {
      return widget.listOrId as int;
    }
    return 0;
  }

  Future<void> _loadListDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final fetched = await context.read<ListService>().getListById(_listId);
      if (mounted) {
        setState(() {
          _list = fetched;
          _isLoading = false;
        });
      }
    } catch (e) {
      // Fallback to initial object if passed
      if (widget.listOrId is MovieList && mounted) {
        setState(() {
          _list = widget.listOrId as MovieList;
          _isLoading = false;
        });
      } else {
        if (mounted) {
          setState(() {
            _errorMessage = e.toString().replaceFirst('Exception: ', '');
            _isLoading = false;
          });
        }
      }
    }
  }

  Future<void> _removeMovie(WatchlistItem movie) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      await context.read<ListService>().removeMovieFromList(_listId, movie.movieId);
      _loadListDetails();
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Removed "${movie.title}" from list')),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _deleteList() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        title: const Text('Delete List?'),
        content: Text('Are you sure you want to delete "${_list?.name}"?'),
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
      await context.read<ListService>().deleteList(_listId);
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('List deleted')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: CineAppBar(title: 'Curated List'),
        body: CineLoadingIndicator(message: 'Loading list films...'),
      );
    }

    if (_list == null) {
      return Scaffold(
        appBar: const CineAppBar(title: 'List Not Found'),
        body: CineEmptyView(
          title: 'List Unavailable',
          subtitle: _errorMessage ?? 'This curated list could not be loaded.',
          icon: Icons.error_outline,
        ),
      );
    }

    final list = _list!;

    return Scaffold(
      appBar: CineAppBar(
        title: list.name,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded,
                color: AppColors.error, size: 20),
            tooltip: 'Delete List',
            onPressed: _deleteList,
          ),
        ],
      ),
      body: list.movies.isEmpty
          ? Column(
              children: [
                _buildHeader(list),
                Expanded(
                  child: CineEmptyView(
                    title: 'List is Empty',
                    subtitle:
                        'No movies have been added to this list yet. Browse films and add them to this collection.',
                    icon: Icons.movie_filter_outlined,
                    action: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pushNamed(RouteNames.discover);
                      },
                      child: const Text('Discover Movies'),
                    ),
                  ),
                ),
              ],
            )
          : CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildHeader(list)),
                SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.58,
                      crossAxisSpacing: AppSpacing.sm,
                      mainAxisSpacing: AppSpacing.md,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final movie = list.movies[index];
                        return _buildMovieItem(context, movie);
                      },
                      childCount: list.movies.length,
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildHeader(MovieList list) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            list.name,
            style: const TextStyle(
              fontFamily: 'Georgia',
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          if (list.description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              list.description,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              if (list.authorName != null) ...[
                const Icon(Icons.person_outline, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  'Curated by ${list.authorName}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
                const SizedBox(width: 12),
              ],
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${list.movies.length} Films',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.accent,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMovieItem(BuildContext context, WatchlistItem movie) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pushNamed(
          RouteNames.movieDetails,
          arguments: movie.movieId,
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
                  if (movie.posterUrl != null)
                    Image.network(
                      movie.posterUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.surfaceElevated,
                        child: const Icon(Icons.movie, color: AppColors.textMuted),
                      ),
                    )
                  else
                    Container(
                      color: AppColors.surfaceElevated,
                      child: const Icon(Icons.movie, color: AppColors.textMuted),
                    ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () => _removeMovie(movie),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close_rounded,
                          color: AppColors.textMuted,
                          size: 14,
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
                    movie.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
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
}
