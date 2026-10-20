import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/genre.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen exploring films by genre with curated visual genre tiles.
class GenresScreen extends StatefulWidget {
  const GenresScreen({super.key});

  @override
  State<GenresScreen> createState() => _GenresScreenState();
}

class _GenresScreenState extends State<GenresScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Genre> _genres = [];

  static const Map<String, IconData> genreIcons = {
    'Action': Icons.flash_on_rounded,
    'Adventure': Icons.explore_rounded,
    'Animation': Icons.auto_awesome_rounded,
    'Comedy': Icons.sentiment_very_satisfied_rounded,
    'Crime': Icons.local_police_rounded,
    'Documentary': Icons.video_camera_back_rounded,
    'Drama': Icons.theater_comedy_rounded,
    'Family': Icons.family_restroom_rounded,
    'Fantasy': Icons.castle_rounded,
    'History': Icons.hourglass_bottom_rounded,
    'Horror': Icons.nightlight_round,
    'Music': Icons.music_note_rounded,
    'Mystery': Icons.psychology_rounded,
    'Romance': Icons.favorite_rounded,
    'Science Fiction': Icons.rocket_launch_rounded,
    'TV Movie': Icons.tv_rounded,
    'Thriller': Icons.warning_amber_rounded,
    'War': Icons.military_tech_rounded,
    'Western': Icons.landscape_rounded,
  };

  @override
  void initState() {
    super.initState();
    _fetchGenres();
  }

  Future<void> _fetchGenres() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _movieService.getGenres();
      setState(() {
        _genres = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);
    final isTablet = MediaQuery.of(context).size.width >= AppSpacing.breakpointStandard;
    final columns = isTablet ? 3 : 2;

    return Scaffold(
      appBar: const CineAppBar(title: 'Genres'),
      body: _isLoading
          ? const CineLoadingIndicator(message: 'Loading genres...')
          : _errorMessage != null
              ? CineErrorView(message: _errorMessage!, onRetry: _fetchGenres)
              : GridView.builder(
                  padding: EdgeInsets.all(padding),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: columns,
                    mainAxisSpacing: AppSpacing.md,
                    crossAxisSpacing: AppSpacing.md,
                    childAspectRatio: 1.8,
                  ),
                  itemCount: _genres.length,
                  itemBuilder: (context, index) {
                    final genre = _genres[index];
                    final icon = genreIcons[genre.name] ?? Icons.movie_filter_rounded;

                    return InkWell(
                      onTap: () {
                        Navigator.of(context).pushNamed(
                          RouteNames.genreMovies,
                          arguments: genre,
                        );
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.surface2,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(icon, color: AppColors.accent, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                genre.name,
                                style: const TextStyle(
                                  fontSize: 14,
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
    );
  }
}
