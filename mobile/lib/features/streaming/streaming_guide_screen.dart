import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/genre.dart';
import '../../models/movie.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/movie_card.dart';

class StreamingPlatform {
  final int id;
  final String name;
  final String emoji;
  final Color brandColor;

  const StreamingPlatform({
    required this.id,
    required this.name,
    required this.emoji,
    required this.brandColor,
  });
}

/// OTT / Streaming Guide screen filtering cinema availability by subscription platform.
class StreamingGuideScreen extends StatefulWidget {
  const StreamingGuideScreen({super.key});

  @override
  State<StreamingGuideScreen> createState() => _StreamingGuideScreenState();
}

class _StreamingGuideScreenState extends State<StreamingGuideScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;

  List<Movie> _movies = [];
  List<Genre> _genres = [];

  int? _selectedProviderId;
  int? _selectedGenreId;

  static const List<StreamingPlatform> platforms = [
    StreamingPlatform(id: 8, name: 'Netflix', emoji: '🔴', brandColor: Color(0xFFE50914)),
    StreamingPlatform(id: 119, name: 'Prime Video', emoji: '🔵', brandColor: Color(0xFF00A8E1)),
    StreamingPlatform(id: 337, name: 'Disney+ / Hotstar', emoji: '⭐', brandColor: Color(0xFF113CCF)),
    StreamingPlatform(id: 350, name: 'Apple TV+', emoji: '🍏', brandColor: Color(0xFF707070)),
    StreamingPlatform(id: 11, name: 'MUBI', emoji: '🎬', brandColor: Color(0xFF002855)),
    StreamingPlatform(id: 384, name: 'Max', emoji: '🟣', brandColor: Color(0xFF002BE7)),
  ];

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final genres = await _movieService.getGenres();
      _genres = genres;
      await _fetchMovies();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchMovies() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _movieService.getMovies(
        genreId: _selectedGenreId,
        withWatchProviders: _selectedProviderId?.toString(),
        watchRegion: 'IN',
        sortBy: 'popularity.desc',
        page: 1,
      );
      setState(() {
        _movies = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _selectPlatform(int? id) {
    setState(() {
      _selectedProviderId = _selectedProviderId == id ? null : id;
    });
    _fetchMovies();
  }

  void _selectGenre(int? id) {
    setState(() {
      _selectedGenreId = _selectedGenreId == id ? null : id;
    });
    _fetchMovies();
  }

  void _openMovieDetails(Movie movie) {
    Navigator.of(context).pushNamed(RouteNames.movieDetails, arguments: movie.id);
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);
    final columns = AppSpacing.gridColumnCount(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'Streaming Guide'),
      body: Column(
        children: [
          // 1. Streaming Platform Selector
          SizedBox(
            height: 52,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: padding, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: platforms.length + 1,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                if (index == 0) {
                  final isAll = _selectedProviderId == null;
                  return ChoiceChip(
                    label: const Text('All Streaming'),
                    selected: isAll,
                    onSelected: (_) => _selectPlatform(null),
                    selectedColor: AppColors.accent,
                    backgroundColor: AppColors.surface2,
                    labelStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: isAll ? FontWeight.w700 : FontWeight.w500,
                      color: isAll ? AppColors.background : AppColors.textSecondary,
                    ),
                  );
                }

                final p = platforms[index - 1];
                final isSelected = _selectedProviderId == p.id;
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(p.emoji, style: const TextStyle(fontSize: 12)),
                      const SizedBox(width: 6),
                      Text(p.name),
                    ],
                  ),
                  selected: isSelected,
                  onSelected: (_) => _selectPlatform(p.id),
                  selectedColor: AppColors.accent,
                  backgroundColor: AppColors.surface2,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? AppColors.background : AppColors.textSecondary,
                  ),
                );
              },
            ),
          ),

          // 2. Genre Sub-Filter
          if (_genres.isNotEmpty)
            SizedBox(
              height: 38,
              child: ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: padding),
                scrollDirection: Axis.horizontal,
                itemCount: _genres.length,
                separatorBuilder: (context, index) => const SizedBox(width: 6),
                itemBuilder: (context, index) {
                  final g = _genres[index];
                  final isSelected = _selectedGenreId == g.id;
                  return FilterChip(
                    label: Text(g.name),
                    selected: isSelected,
                    onSelected: (_) => _selectGenre(g.id),
                    selectedColor: AppColors.accent.withValues(alpha: 0.2),
                    backgroundColor: AppColors.surface2,
                    side: BorderSide(color: isSelected ? AppColors.accent : AppColors.border),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected ? AppColors.accent : AppColors.textMuted,
                    ),
                  );
                },
              ),
            ),

          const SizedBox(height: 8),

          // 3. Movies Grid
          Expanded(
            child: _isLoading
                ? const CineLoadingIndicator(message: 'Checking streaming catalogs...')
                : _errorMessage != null
                    ? CineErrorView(message: _errorMessage!, onRetry: _fetchMovies)
                    : _movies.isEmpty
                        ? CineEmptyView(
                            title: 'No Movies Available on This Service',
                            subtitle: 'Try clearing the genre filter or selecting another streaming provider.',
                            action: OutlinedButton(
                              onPressed: () {
                                setState(() {
                                  _selectedGenreId = null;
                                  _selectedProviderId = null;
                                });
                                _fetchMovies();
                              },
                              child: const Text('Reset Filters'),
                            ),
                          )
                        : LayoutBuilder(
                            builder: (context, constraints) {
                              final cardWidth = (constraints.maxWidth - (padding * 2) - ((columns - 1) * AppSpacing.md)) / columns;

                              return RefreshIndicator(
                                onRefresh: _fetchMovies,
                                color: AppColors.accent,
                                backgroundColor: AppColors.surface,
                                child: GridView.builder(
                                  padding: EdgeInsets.fromLTRB(padding, 8, padding, 24),
                                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: columns,
                                    mainAxisSpacing: AppSpacing.lg,
                                    crossAxisSpacing: AppSpacing.md,
                                    childAspectRatio: cardWidth / (cardWidth * 1.5 + 46),
                                  ),
                                  itemCount: _movies.length,
                                  itemBuilder: (context, index) {
                                    final movie = _movies[index];
                                    return MovieCard(
                                      movie: movie,
                                      width: cardWidth,
                                      onTap: () => _openMovieDetails(movie),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
