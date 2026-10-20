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

/// Trending Films screen featuring time window toggle (Today vs This Week).
class TrendingScreen extends StatefulWidget {
  const TrendingScreen({super.key});

  @override
  State<TrendingScreen> createState() => _TrendingScreenState();
}

class _TrendingScreenState extends State<TrendingScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Movie> _movies = [];
  bool _isToday = false; // false = This Week, true = Today

  @override
  void initState() {
    super.initState();
    _fetchTrending();
  }

  Future<void> _fetchTrending() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await _movieService.getTrending(page: 1);
      setState(() {
        _movies = results;
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
    Navigator.of(context).pushNamed(
      RouteNames.movieDetails,
      arguments: movie.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);
    final columns = AppSpacing.gridColumnCount(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'Trending'),
      body: Column(
        children: [
          // Time window toggle bar
          Padding(
            padding: EdgeInsets.fromLTRB(padding, 12, padding, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.surface2,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              if (_isToday) {
                                setState(() => _isToday = false);
                                _fetchTrending();
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: !_isToday ? AppColors.accent : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'This Week',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: !_isToday ? AppColors.background : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              if (!_isToday) {
                                setState(() => _isToday = true);
                                _fetchTrending();
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _isToday ? AppColors.accent : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Today',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: _isToday ? AppColors.background : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Content body
          Expanded(child: _buildBody(columns, padding)),
        ],
      ),
    );
  }

  Widget _buildBody(int columns, double padding) {
    if (_isLoading) {
      return const CineLoadingIndicator(message: 'Loading trending films...');
    }

    if (_errorMessage != null) {
      return CineErrorView(message: _errorMessage!, onRetry: _fetchTrending);
    }

    if (_movies.isEmpty) {
      return const CineEmptyView(title: 'No Trending Films Found');
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - (padding * 2) - ((columns - 1) * AppSpacing.md)) / columns;

        return RefreshIndicator(
          onRefresh: _fetchTrending,
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
