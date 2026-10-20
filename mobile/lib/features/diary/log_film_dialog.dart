import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie.dart';
import '../../models/movie_detail.dart';
import '../../services/diary_service.dart';
import '../../services/movie_service.dart';
import '../../services/watched_service.dart';

/// Modal dialog or bottom sheet to log a film screening in the Film Diary.
class LogFilmDialog extends StatefulWidget {
  final dynamic initialMovie; // Movie, MovieDetail, or null

  const LogFilmDialog({super.key, this.initialMovie});

  static Future<bool?> show(BuildContext context, {dynamic movie}) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LogFilmDialog(initialMovie: movie),
    );
  }

  @override
  State<LogFilmDialog> createState() => _LogFilmDialogState();
}

class _LogFilmDialogState extends State<LogFilmDialog> {
  final MovieService _movieService = MovieService();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _reviewController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _companionController = TextEditingController();

  int? _selectedMovieId;
  String? _selectedTitle;
  String? _selectedPoster;
  int? _selectedYear;

  DateTime _watchedDate = DateTime.now();
  double _rating = 0.0;
  bool _isRewatch = false;
  bool _containsSpoilers = false;

  bool _isSearching = false;
  List<Movie> _searchResults = [];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialMovie != null) {
      _extractMovieData(widget.initialMovie);
    }
  }

  void _extractMovieData(dynamic movie) {
    if (movie is Movie) {
      _selectedMovieId = movie.id;
      _selectedTitle = movie.title;
      _selectedPoster = movie.posterPath;
      _selectedYear = int.tryParse(movie.year);
    } else if (movie is MovieDetail) {
      _selectedMovieId = movie.id;
      _selectedTitle = movie.title;
      _selectedPoster = movie.posterPath;
      _selectedYear = int.tryParse(movie.year);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _reviewController.dispose();
    _locationController.dispose();
    _companionController.dispose();
    super.dispose();
  }

  Future<void> _searchMovies(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);
    try {
      final results = await _movieService.searchMovies(query);
      if (mounted) {
        setState(() {
          _searchResults = results;
          _isSearching = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSearching = false);
      }
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _watchedDate,
      firstDate: DateTime(1900),
      lastDate: DateTime.now().add(const Duration(days: 1)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.accent,
              onPrimary: AppColors.background,
              surface: AppColors.surfaceElevated,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _watchedDate = picked);
    }
  }

  Future<void> _submit() async {
    if (_selectedMovieId == null || _selectedTitle == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a film first.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    try {
      await context.read<DiaryService>().logFilm(
            movieId: _selectedMovieId!,
            title: _selectedTitle!,
            releaseYear: _selectedYear,
            posterPath: _selectedPoster,
            watchedDate: _watchedDate,
            rating: _rating > 0 ? _rating : null,
            reviewText: _reviewController.text.trim().isNotEmpty
                ? _reviewController.text.trim()
                : null,
            containsSpoilers: _containsSpoilers,
            isRewatch: _isRewatch,
            loggedLocation: _locationController.text.trim().isNotEmpty
                ? _locationController.text.trim()
                : null,
            companionName: _companionController.text.trim().isNotEmpty
                ? _companionController.text.trim()
                : null,
          );

      // Also register into WatchedService
      if (mounted) {
        await context.read<WatchedService>().markAsWatched(
          {
            'id': _selectedMovieId,
            'title': _selectedTitle,
            'poster_path': _selectedPoster,
          },
          rating: _rating > 0 ? _rating : null,
          platform: _locationController.text.trim().isNotEmpty
              ? _locationController.text.trim()
              : null,
        );
      }

      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Logged "$_selectedTitle" in your Film Diary!'),
          backgroundColor: AppColors.accent,
        ),
      );
      navigator.pop(true);
    } catch (e) {
      setState(() => _isSubmitting = false);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed to log film: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        border: Border(
          top: BorderSide(color: AppColors.border, width: 1.5),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.edit_calendar_rounded,
                    color: AppColors.accent, size: 22),
                const SizedBox(width: 10),
                const Text(
                  'Log Screening',
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded,
                      color: AppColors.textMuted, size: 22),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Scrollable form body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Movie Selector / Search
                  if (_selectedMovieId == null) ...[
                    const Text(
                      'Search Film to Log',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Enter movie title...',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        suffixIcon: _isSearching
                            ? const Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              )
                            : null,
                      ),
                      onChanged: _searchMovies,
                    ),
                    if (_searchResults.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        constraints: const BoxConstraints(maxHeight: 180),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: _searchResults.length,
                          separatorBuilder: (context, index) =>
                              const Divider(height: 1, color: AppColors.border),
                          itemBuilder: (context, idx) {
                            final m = _searchResults[idx];
                            return ListTile(
                              dense: true,
                              leading: m.posterUrl != null
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: Image.network(
                                        m.posterUrl!,
                                        width: 32,
                                        height: 48,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) =>
                                            const Icon(Icons.movie, size: 20),
                                      ),
                                    )
                                  : const Icon(Icons.movie, size: 20),
                              title: Text(
                                m.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(m.year,
                                  style: const TextStyle(
                                      fontSize: 11, color: AppColors.textMuted)),
                              onTap: () {
                                setState(() {
                                  _selectedMovieId = m.id;
                                  _selectedTitle = m.title;
                                  _selectedPoster = m.posterPath;
                                  _selectedYear = int.tryParse(m.year);
                                  _searchResults = [];
                                });
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ] else ...[
                    // Selected Movie Card
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          if (_selectedPoster != null)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.network(
                                'https://image.tmdb.org/t/p/w200$_selectedPoster',
                                width: 44,
                                height: 66,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(Icons.movie, size: 24),
                              ),
                            ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _selectedTitle ?? '',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                if (_selectedYear != null)
                                  Text(
                                    '${_selectedYear!}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          if (widget.initialMovie == null)
                            IconButton(
                              icon: const Icon(Icons.change_circle_outlined,
                                  color: AppColors.accent),
                              tooltip: 'Change Film',
                              onPressed: () {
                                setState(() {
                                  _selectedMovieId = null;
                                  _selectedTitle = null;
                                  _selectedPoster = null;
                                  _selectedYear = null;
                                });
                              },
                            ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // 2. Watched Date & Rewatch
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _selectDate,
                          icon: const Icon(Icons.calendar_today_rounded, size: 16),
                          label: Text(
                            '${_watchedDate.day}/${_watchedDate.month}/${_watchedDate.year}',
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      FilterChip(
                        selected: _isRewatch,
                        label: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.repeat_rounded, size: 16),
                            SizedBox(width: 4),
                            Text('Rewatch'),
                          ],
                        ),
                        onSelected: (val) => setState(() => _isRewatch = val),
                        selectedColor: AppColors.accent.withValues(alpha: 0.2),
                        checkmarkColor: AppColors.accent,
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // 3. Star Rating
                  const Text(
                    'Rating',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starVal = index + 1.0;
                      final isFilled = _rating >= starVal;
                      return IconButton(
                        iconSize: 32,
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        icon: Icon(
                          isFilled
                              ? Icons.star_rounded
                              : Icons.star_outline_rounded,
                          color: isFilled
                              ? AppColors.star
                              : AppColors.textMuted.withValues(alpha: 0.5),
                        ),
                        onPressed: () {
                          setState(() {
                            if (_rating == starVal) {
                              _rating = 0.0;
                            } else {
                              _rating = starVal;
                            }
                          });
                        },
                      );
                    }),
                  ),
                  if (_rating > 0)
                    Center(
                      child: Text(
                        '${_rating.toStringAsFixed(1)} / 5.0 Stars',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.star,
                        ),
                      ),
                    ),

                  const SizedBox(height: 20),

                  // 4. Screening Location & Companion
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _locationController,
                          decoration: const InputDecoration(
                            labelText: 'Venue / Platform',
                            hintText: 'e.g. IMAX, Home, Netflix',
                            prefixIcon: Icon(Icons.place_outlined, size: 18),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _companionController,
                          decoration: const InputDecoration(
                            labelText: 'Watched With',
                            hintText: 'e.g. Sarah, Solo',
                            prefixIcon: Icon(Icons.people_outline, size: 18),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 5. Notes / Thoughts
                  TextField(
                    controller: _reviewController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Screening Notes & Reflections',
                      hintText: 'Add personal notes, thoughts, or review remarks...',
                      alignLabelWithHint: true,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // 6. Spoilers Checkbox
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Contains Spoilers',
                        style: TextStyle(fontSize: 13)),
                    subtitle: const Text(
                      'Hides review snippet until tapped by other cinephiles',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                    value: _containsSpoilers,
                    activeThumbColor: AppColors.accent,
                    onChanged: (val) => setState(() => _containsSpoilers = val),
                  ),

                  const SizedBox(height: 24),

                  // 7. Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.background,
                              ),
                            )
                          : const Text(
                              'Save to Film Diary',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
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
    );
  }
}
