import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/content_advisory.dart';
import '../../models/credit.dart';
import '../../models/movie.dart';
import '../../models/movie_detail.dart';
import '../../models/review.dart';
import '../../models/video.dart';
import '../../models/watch_provider.dart';
import '../../services/favorite_service.dart';
import '../../services/movie_service.dart';
import '../../services/review_service.dart';
import '../../services/watchlist_service.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/movie_horizontal_list.dart';
import '../../widgets/rating_badge.dart';
import '../diary/log_film_dialog.dart';

/// Full Movie Details Screen displaying backdrop, cast, crew, trailers, streaming providers,
/// content advisories, community reviews, and similar titles.
class MovieDetailsScreen extends StatefulWidget {
  final int movieId;

  const MovieDetailsScreen({super.key, required this.movieId});

  @override
  State<MovieDetailsScreen> createState() => _MovieDetailsScreenState();
}

class _MovieDetailsScreenState extends State<MovieDetailsScreen> {
  final MovieService _movieService = MovieService();

  bool _isLoading = true;
  String? _errorMessage;

  MovieDetail? _details;
  MovieCredits _credits = const MovieCredits();
  List<VideoTrailer> _trailers = [];
  List<Movie> _recommendations = [];
  MovieWatchProviders _watchProviders = const MovieWatchProviders();
  List<ContentAdvisory> _advisories = [];
  List<Review> _reviews = [];
  final Set<int> _revealedSpoilers = {};

  @override
  void initState() {
    super.initState();
    _loadAllDetails();
    _checkLikeStatus();
  }

  void _checkLikeStatus() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FavoriteService>().checkStatus(widget.movieId);
    });
  }

  Future<void> _loadAllDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _movieService.getMovieDetails(widget.movieId),
        _movieService.getMovieCredits(widget.movieId),
        _movieService.getMovieVideos(widget.movieId),
        _movieService.getRecommendations(widget.movieId),
        _movieService.getMovieWatchProviders(widget.movieId),
        _movieService.getContentAdvisories(widget.movieId),
        context.read<ReviewService>().fetchMovieReviews(widget.movieId),
      ]);

      if (mounted) {
        setState(() {
          _details = results[0] as MovieDetail;
          _credits = results[1] as MovieCredits;
          _trailers = results[2] as List<VideoTrailer>;
          _recommendations = results[3] as List<Movie>;
          _watchProviders = results[4] as MovieWatchProviders;
          _advisories = results[5] as List<ContentAdvisory>;
          _reviews = results[6] as List<Review>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _playTrailer(VideoTrailer trailer) async {
    final uri = Uri.parse(trailer.youtubeUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open video link.')),
        );
      }
    }
  }

  Future<void> _toggleFavorite() async {
    if (_details == null) return;
    final favService = context.read<FavoriteService>();
    final isFav = favService.isLiked(widget.movieId);
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    try {
      if (isFav) {
        await favService.unlikeMovie(widget.movieId);
        scaffoldMessenger.showSnackBar(
          SnackBar(content: Text('Removed "${_details!.title}" from Favorites.')),
        );
      } else {
        await favService.likeMovie(_details!);
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Added "${_details!.title}" to Favorites!'),
            backgroundColor: AppColors.favorite,
          ),
        );
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _toggleWatchlist() async {
    if (_details == null) return;
    final watchlistService = context.read<WatchlistService>();
    final inWatchlist = watchlistService.isInWatchlist(widget.movieId);
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    try {
      if (inWatchlist) {
        await watchlistService.removeFromWatchlist(widget.movieId);
        scaffoldMessenger.showSnackBar(
          SnackBar(content: Text('Removed "${_details!.title}" from Watchlist.')),
        );
      } else {
        await watchlistService.addToWatchlist(_details!);
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Queued "${_details!.title}" to Watchlist!'),
            backgroundColor: AppColors.accent,
          ),
        );
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _openLogDialog() async {
    if (_details == null) return;
    final logged = await LogFilmDialog.show(context, movie: _details!);
    if (logged == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logged "${_details!.title}" to Film Diary!'),
          backgroundColor: AppColors.accent,
        ),
      );
    }
  }

  Future<void> _openWriteReview() async {
    if (_details == null) return;
    final result = await Navigator.of(context).pushNamed(
      RouteNames.writeReview,
      arguments: _details,
    );
    if (result == true && mounted) {
      final reviews = await context.read<ReviewService>().fetchMovieReviews(widget.movieId);
      if (mounted) setState(() => _reviews = reviews);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: CineLoadingIndicator(message: 'Loading cinematic details...'),
      );
    }

    if (_errorMessage != null || _details == null) {
      return Scaffold(
        appBar: AppBar(),
        body: CineErrorView(
          message: _errorMessage ?? 'Unable to find movie details.',
          onRetry: _loadAllDetails,
        ),
      );
    }

    final movie = _details!;
    final isFavorite = context.watch<FavoriteService>().isLiked(widget.movieId);
    final inWatchlist = context.watch<WatchlistService>().isInWatchlist(widget.movieId);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // 1. Collapsible Hero Backdrop with App Bar
          _buildSliverAppBar(movie, isFavorite),

          // 2. Movie Content Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Tagline
                  Text(
                    movie.title,
                    style: const TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.3,
                      height: 1.2,
                    ),
                  ),

                  if (movie.tagline != null && movie.tagline!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      '"${movie.tagline!}"',
                      style: const TextStyle(
                        fontStyle: FontStyle.italic,
                        fontSize: 14,
                        color: AppColors.accent,
                        height: 1.3,
                      ),
                    ),
                  ],

                  const SizedBox(height: 12),

                  // Metadata Badges (Year, Runtime, Rating, Director)
                  Row(
                    children: [
                      RatingBadge(rating: movie.voteAverage),
                      const SizedBox(width: 10),
                      _buildMetaPill(movie.year),
                      if (movie.runtimeFormatted != '—') ...[
                        const SizedBox(width: 8),
                        _buildMetaPill(movie.runtimeFormatted),
                      ],
                      if (_credits.directorName != null) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Dir. ${_credits.directorName}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Genre Chips
                  if (movie.genres.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: movie.genres.map((g) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.surface2,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.border, width: 0.8),
                          ),
                          child: Text(
                            g.name,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Action Buttons Row (Watchlist, Log Film, Write Review)
                  _buildActionButtonsRow(movie, inWatchlist),

                  const SizedBox(height: 24),

                  // Overview / Synopsis
                  const Text(
                    'Synopsis',
                    style: TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    movie.overview.isNotEmpty
                        ? movie.overview
                        : 'No synopsis available for this film.',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Watch Providers / Streaming availability
                  if (_watchProviders.hasAnyProvider) ...[
                    _buildWatchProvidersSection(),
                    const SizedBox(height: 28),
                  ],

                  // Content Advisories
                  if (_advisories.isNotEmpty) ...[
                    _buildAdvisoriesSection(),
                    const SizedBox(height: 28),
                  ],

                  // Trailers Section
                  if (_trailers.isNotEmpty) ...[
                    _buildTrailersSection(),
                    const SizedBox(height: 28),
                  ],

                  // Cast & Crew Section
                  if (_credits.cast.isNotEmpty) ...[
                    _buildCastSection(),
                    const SizedBox(height: 28),
                  ],

                  // Community Reviews Section
                  _buildReviewsSection(),

                  const SizedBox(height: 28),

                  // Recommendations Shelf
                  if (_recommendations.isNotEmpty) ...[
                    MovieHorizontalList(
                      title: 'More Like This',
                      subtitle: 'Films with similar tone and style',
                      movies: _recommendations,
                      onMovieTap: (rec) {
                        Navigator.of(context).pushReplacementNamed(
                          RouteNames.movieDetails,
                          arguments: rec.id,
                        );
                      },
                    ),
                  ],

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(MovieDetail movie, bool isFavorite) {
    final backdropUrl = movie.backdropUrl ?? movie.posterUrl;

    return SliverAppBar(
      expandedHeight: 280,
      pinned: true,
      backgroundColor: AppColors.background,
      leading: IconButton(
        icon: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.background.withValues(alpha: 0.7),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary, size: 20),
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      actions: [
        IconButton(
          icon: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.background.withValues(alpha: 0.7),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              color: isFavorite ? AppColors.favorite : AppColors.textPrimary,
              size: 20,
            ),
          ),
          tooltip: isFavorite ? 'Remove Favorite' : 'Add to Favorites',
          onPressed: _toggleFavorite,
        ),
        if (_trailers.isNotEmpty)
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.85),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.play_arrow_rounded, color: AppColors.background, size: 20),
            ),
            tooltip: 'Watch Trailer',
            onPressed: () => _playTrailer(_trailers.first),
          ),
        const SizedBox(width: 8),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (backdropUrl != null)
              Image.network(
                backdropUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    Container(color: AppColors.surface),
              )
            else
              Container(color: AppColors.surface),

            // Top vignette
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.background.withValues(alpha: 0.7),
                    Colors.transparent,
                    AppColors.background.withValues(alpha: 0.8),
                    AppColors.background,
                  ],
                  stops: const [0.0, 0.35, 0.8, 1.0],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.border, width: 0.8),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildActionButtonsRow(MovieDetail movie, bool inWatchlist) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: _toggleWatchlist,
            icon: Icon(
              inWatchlist ? Icons.bookmark_added_rounded : Icons.bookmark_add_outlined,
              size: 16,
              color: inWatchlist ? AppColors.accent : null,
            ),
            label: Text(inWatchlist ? 'In Watchlist' : 'Watchlist'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: _openLogDialog,
            icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
            label: const Text('Log Film'),
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          onPressed: _openWriteReview,
          icon: const Icon(Icons.rate_review_outlined, color: AppColors.accent),
          tooltip: 'Write Review',
          style: IconButton.styleFrom(
            backgroundColor: AppColors.surface,
            side: const BorderSide(color: AppColors.border),
          ),
        ),
      ],
    );
  }

  Widget _buildWatchProvidersSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Where to Stream',
          style: TextStyle(
            fontFamily: 'Georgia',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 10,
          children: _watchProviders.flatStreamProviders.map((p) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (p.logoUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      p.logoUrl!,
                      width: 32,
                      height: 32,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.tv, size: 24, color: AppColors.accent),
                    ),
                  ),
                const SizedBox(width: 8),
                Text(
                  p.providerName,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAdvisoriesSection() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: AppColors.accent),
              SizedBox(width: 8),
              Text(
                'Content Advisory',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ..._advisories.map((a) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Text(
                '• ${a.category}: ${a.severity}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTrailersSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Videos & Trailers',
          style: TextStyle(
            fontFamily: 'Georgia',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _trailers.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final trailer = _trailers[index];
              return GestureDetector(
                onTap: () => _playTrailer(trailer),
                child: Container(
                  width: 200,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.network(
                          trailer.thumbnailUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: AppColors.surface2,
                            child: const Icon(Icons.video_camera_back, color: AppColors.textMuted),
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              AppColors.background.withValues(alpha: 0.85),
                            ],
                          ),
                        ),
                      ),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.play_arrow_rounded,
                            size: 24,
                            color: AppColors.background,
                          ),
                        ),
                      ),
                      Positioned(
                        left: 8,
                        right: 8,
                        bottom: 8,
                        child: Text(
                          trailer.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCastSection() {
    final topCast = _credits.cast.take(12).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Top Cast',
          style: TextStyle(
            fontFamily: 'Georgia',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: topCast.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final member = topCast[index];
              return SizedBox(
                width: 80,
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 34,
                      backgroundColor: AppColors.surface2,
                      backgroundImage: member.profileUrl != null
                          ? NetworkImage(member.profileUrl!)
                          : null,
                      child: member.profileUrl == null
                          ? const Icon(Icons.person_rounded, color: AppColors.textMuted, size: 28)
                          : null,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      member.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      member.character,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildReviewsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Community Reviews',
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: _openWriteReview,
              icon: const Icon(Icons.edit, size: 14),
              label: const Text('Write Review', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (_reviews.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: const Center(
              child: Text(
                'No reviews published yet. Be the first to review this film!',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ),
          )
        else
          ..._reviews.take(3).map((r) {
            final isSpoilerRevealed = _revealedSpoilers.contains(r.id);

            return Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      RatingBadge(rating: r.rating),
                      const SizedBox(width: 8),
                      Text(
                        r.username,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          r.intentCategory,
                          style: const TextStyle(fontSize: 10, color: AppColors.accent),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (r.containsSpoilers && !isSpoilerRevealed)
                    GestureDetector(
                      onTap: () => setState(() => _revealedSpoilers.add(r.id)),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Contains Spoilers (Tap to reveal)',
                          style: TextStyle(fontSize: 11, color: AppColors.warning),
                        ),
                      ),
                    )
                  else
                    Text(
                      r.reviewText,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                ],
              ),
            );
          }),
      ],
    );
  }
}
