import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/movie_card.dart';

/// Screen displaying top acclaimed movies in a specific international language.
class LanguageDetailsScreen extends StatefulWidget {
  final String languageCode;
  final String languageName;

  const LanguageDetailsScreen({
    super.key,
    required this.languageCode,
    required this.languageName,
  });

  @override
  State<LanguageDetailsScreen> createState() => _LanguageDetailsScreenState();
}

class _LanguageDetailsScreenState extends State<LanguageDetailsScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Movie> _movies = [];

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
        language: widget.languageCode,
        sortBy: 'vote_average.desc',
        ratingGte: '7.0',
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
      appBar: CineAppBar(title: '${widget.languageName} Cinema'),
      body: _isLoading
          ? const CineLoadingIndicator(message: 'Loading international cinema...')
          : _errorMessage != null
              ? CineErrorView(message: _errorMessage!, onRetry: _fetchMovies)
              : _movies.isEmpty
                  ? CineEmptyView(title: 'No Movies Found for ${widget.languageName}')
                  : LayoutBuilder(
                      builder: (context, constraints) {
                        final cardWidth = (constraints.maxWidth - (padding * 2) - ((columns - 1) * AppSpacing.md)) / columns;

                        return RefreshIndicator(
                          onRefresh: _fetchMovies,
                          color: AppColors.accent,
                          backgroundColor: AppColors.surface,
                          child: GridView.builder(
                            padding: EdgeInsets.fromLTRB(padding, 12, padding, 24),
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
    );
  }
}
