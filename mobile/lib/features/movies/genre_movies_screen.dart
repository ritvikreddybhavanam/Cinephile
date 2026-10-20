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

/// Screen displaying movies belonging to a specific genre.
class GenreMoviesScreen extends StatefulWidget {
  final Genre genre;

  const GenreMoviesScreen({super.key, required this.genre});

  @override
  State<GenreMoviesScreen> createState() => _GenreMoviesScreenState();
}

class _GenreMoviesScreenState extends State<GenreMoviesScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Movie> _movies = [];
  String _sortBy = 'popularity.desc';

  @override
  void initState() {
    super.initState();
    _fetchMovies();
  }

  Future<void> _fetchMovies() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _movieService.getMovies(
        genreId: widget.genre.id,
        sortBy: _sortBy,
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

  void _openMovieDetails(Movie movie) {
    Navigator.of(context).pushNamed(RouteNames.movieDetails, arguments: movie.id);
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);
    final columns = AppSpacing.gridColumnCount(context);

    return Scaffold(
      appBar: CineAppBar(title: widget.genre.name),
      body: Column(
        children: [
          // Sort bar
          Padding(
            padding: EdgeInsets.symmetric(horizontal: padding, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_movies.length} ${widget.genre.name} Titles',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                ),
                DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _sortBy,
                    dropdownColor: AppColors.surfaceElevated,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.accent),
                    items: const [
                      DropdownMenuItem(value: 'popularity.desc', child: Text('Most Popular')),
                      DropdownMenuItem(value: 'vote_average.desc', child: Text('Top Rated')),
                      DropdownMenuItem(value: 'primary_release_date.desc', child: Text('Newest')),
                    ],
                    onChanged: (val) {
                      if (val != null && val != _sortBy) {
                        setState(() => _sortBy = val);
                        _fetchMovies();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? const CineLoadingIndicator(message: 'Loading films...')
                : _errorMessage != null
                    ? CineErrorView(message: _errorMessage!, onRetry: _fetchMovies)
                    : _movies.isEmpty
                        ? const CineEmptyView(title: 'No Movies in this Genre')
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
