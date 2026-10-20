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

/// New Releases Screen showing the freshest cinematic releases.
class NewReleasesScreen extends StatefulWidget {
  const NewReleasesScreen({super.key});

  @override
  State<NewReleasesScreen> createState() => _NewReleasesScreenState();
}

class _NewReleasesScreenState extends State<NewReleasesScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Movie> _movies = [];
  List<Genre> _genres = [];
  int? _selectedGenreId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _movieService.getGenres(),
        _movieService.getNewReleases(genreId: _selectedGenreId),
      ]);
      setState(() {
        _genres = results[0] as List<Genre>;
        _movies = results[1] as List<Movie>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _filterByGenre(int? genreId) async {
    setState(() {
      _selectedGenreId = genreId;
      _isLoading = true;
    });

    try {
      final movies = await _movieService.getNewReleases(genreId: _selectedGenreId);
      setState(() {
        _movies = movies;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _openMovieDetails(Movie movie) {
    Navigator.of(context).pushNamed(RouteNames.movieDetails, arguments: movie.id);
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);
    final columns = AppSpacing.gridColumnCount(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'New Releases'),
      body: Column(
        children: [
          // Genre horizontal chips
          if (_genres.isNotEmpty)
            SizedBox(
              height: 48,
              child: ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: padding, vertical: 6),
                scrollDirection: Axis.horizontal,
                itemCount: _genres.length + 1,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    final isAll = _selectedGenreId == null;
                    return ChoiceChip(
                      label: const Text('All Releases'),
                      selected: isAll,
                      onSelected: (_) => _filterByGenre(null),
                      selectedColor: AppColors.accent,
                      backgroundColor: AppColors.surface2,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: isAll ? FontWeight.w700 : FontWeight.w500,
                        color: isAll ? AppColors.background : AppColors.textSecondary,
                      ),
                    );
                  }
                  final g = _genres[index - 1];
                  final isSelected = _selectedGenreId == g.id;
                  return ChoiceChip(
                    label: Text(g.name),
                    selected: isSelected,
                    onSelected: (_) => _filterByGenre(isSelected ? null : g.id),
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

          Expanded(child: _buildBody(columns, padding)),
        ],
      ),
    );
  }

  Widget _buildBody(int columns, double padding) {
    if (_isLoading) {
      return const CineLoadingIndicator(message: 'Fetching newest films...');
    }

    if (_errorMessage != null) {
      return CineErrorView(message: _errorMessage!, onRetry: _loadData);
    }

    if (_movies.isEmpty) {
      return const CineEmptyView(title: 'No New Releases Found');
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - (padding * 2) - ((columns - 1) * AppSpacing.md)) / columns;

        return RefreshIndicator(
          onRefresh: _loadData,
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
    );
  }
}
