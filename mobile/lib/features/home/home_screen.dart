import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../models/movie.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/movie_horizontal_list.dart';
import '../../widgets/rating_badge.dart';

/// The Home / Dashboard screen showcasing the Hero featured movie and movie carousels.
class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigateTab;

  const HomeScreen({super.key, this.onNavigateTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final MovieService _movieService = MovieService();

  bool _isLoading = true;
  String? _errorMessage;

  Movie? _heroMovie;
  List<Movie> _trendingMovies = [];
  List<Movie> _popularMovies = [];
  List<Movie> _topRatedMovies = [];

  @override
  void initState() {
    super.initState();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _movieService.getTrending(page: 1),
        _movieService.getPopular(page: 1),
        _movieService.getMovies(sortBy: 'vote_average.desc', ratingGte: '8.0'),
      ]);

      final trending = results[0];
      final popular = results[1];
      final topRated = results[2];

      setState(() {
        _trendingMovies = trending;
        _popularMovies = popular;
        _topRatedMovies = topRated;
        // Select the first trending movie with a backdrop as the Hero
        _heroMovie = trending.firstWhere(
          (m) => m.backdropPath != null && m.backdropPath!.isNotEmpty,
          orElse: () => trending.isNotEmpty ? trending.first : null as dynamic,
        );
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
    return Scaffold(
      appBar: CineAppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: AppColors.textPrimary),
            tooltip: 'Search & Discover',
            onPressed: () {
              if (widget.onNavigateTab != null) {
                widget.onNavigateTab!(1); // Switch to Discover tab
              } else {
                Navigator.of(context).pushNamed(RouteNames.discover);
              }
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const CineLoadingIndicator(message: 'Loading cinema experience...');
    }

    if (_errorMessage != null) {
      return CineErrorView(
        message: _errorMessage!,
        onRetry: _loadHomeData,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadHomeData,
      color: AppColors.accent,
      backgroundColor: AppColors.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(bottom: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Hero Featured Movie
            if (_heroMovie != null) _buildHeroBanner(_heroMovie!),

            const SizedBox(height: 24),

            // 2. Trending This Week
            MovieHorizontalList(
              title: 'Trending This Week',
              subtitle: 'Top titles being watched by cinephiles right now',
              movies: _trendingMovies,
              onMovieTap: _openMovieDetails,
              onSeeAllTap: () => widget.onNavigateTab?.call(1),
            ),

            const SizedBox(height: 28),

            // 3. Popular Cinema
            MovieHorizontalList(
              title: 'Popular Right Now',
              subtitle: 'Most beloved releases globally',
              movies: _popularMovies,
              onMovieTap: _openMovieDetails,
              onSeeAllTap: () => widget.onNavigateTab?.call(1),
            ),

            const SizedBox(height: 28),

            // 4. Critically Acclaimed / Top Rated
            MovieHorizontalList(
              title: 'Critically Acclaimed',
              subtitle: 'Highest audience & critical scores',
              movies: _topRatedMovies,
              onMovieTap: _openMovieDetails,
              onSeeAllTap: () => widget.onNavigateTab?.call(1),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner(Movie movie) {
    final backdropUrl = movie.backdropUrl;
    final screenHeight = MediaQuery.of(context).size.height;
    final heroHeight = (screenHeight * 0.46).clamp(320.0, 480.0);

    return Stack(
      children: [
        // Backdrop Image
        SizedBox(
          height: heroHeight,
          width: double.infinity,
          child: backdropUrl != null
              ? Image.network(
                  backdropUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      Container(color: AppColors.surface),
                )
              : Container(color: AppColors.surface),
        ),

        // Gradient Vignette / Scrim (Midnight Cinema signature)
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.background.withValues(alpha: 0.3),
                  AppColors.background.withValues(alpha: 0.5),
                  AppColors.background.withValues(alpha: 0.9),
                  AppColors.background,
                ],
                stops: const [0.0, 0.4, 0.75, 1.0],
              ),
            ),
          ),
        ),

        // Hero Content
        Positioned(
          left: 16,
          right: 16,
          bottom: 12,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Rating & Year row
              Row(
                children: [
                  RatingBadge(rating: movie.voteAverage),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surface2.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.border, width: 0.8),
                    ),
                    child: Text(
                      movie.year,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // Title
              Text(
                movie.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.2,
                  letterSpacing: -0.4,
                ),
              ),

              const SizedBox(height: 6),

              // Overview snippet
              if (movie.overview.isNotEmpty)
                Text(
                  movie.overview,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),

              const SizedBox(height: 14),

              // Action button: View Details
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _openMovieDetails(movie),
                  icon: const Icon(Icons.info_outline_rounded, size: 18),
                  label: const Text('View Film Details'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
