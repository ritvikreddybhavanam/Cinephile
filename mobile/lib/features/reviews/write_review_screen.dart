import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie.dart';
import '../../models/movie_detail.dart';
import '../../models/review.dart';
import '../../services/review_service.dart';
import '../../widgets/cine_app_bar.dart';

/// Screen allowing users to write a review with star ratings, 5 intent categories, and spoiler flag.
class WriteReviewScreen extends StatefulWidget {
  final dynamic movie; // Movie, MovieDetail, or Map<String, dynamic>

  const WriteReviewScreen({super.key, this.movie});

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  final TextEditingController _reviewController = TextEditingController();
  double _rating = 4.0;
  ReviewIntent _selectedIntent = ReviewIntent.generalCritique;
  bool _containsSpoilers = false;
  bool _isSubmitting = false;

  int _movieId = 0;
  String _movieTitle = '';
  String? _moviePoster;
  int? _movieReleaseYear;

  @override
  void initState() {
    super.initState();
    _extractMovieData();
  }

  void _extractMovieData() {
    final m = widget.movie;
    if (m is Movie) {
      _movieId = m.id;
      _movieTitle = m.title;
      _moviePoster = m.posterPath;
      _movieReleaseYear = int.tryParse(m.year);
    } else if (m is MovieDetail) {
      _movieId = m.id;
      _movieTitle = m.title;
      _moviePoster = m.posterPath;
      _movieReleaseYear = int.tryParse(m.year);
    } else if (m is Map<String, dynamic>) {
      _movieId = (m['id'] as num?)?.toInt() ?? 0;
      _movieTitle = m['title'] as String? ?? 'Untitled Film';
      _moviePoster = m['poster_path'] as String? ?? m['poster'] as String?;
      _movieReleaseYear = (m['year'] as num?)?.toInt();
    }
  }

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    final text = _reviewController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write your review before submitting.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    try {
      await context.read<ReviewService>().createReview(
            movieId: _movieId,
            movieTitle: _movieTitle,
            moviePoster: _moviePoster,
            movieReleaseYear: _movieReleaseYear,
            rating: _rating,
            reviewText: text,
            containsSpoilers: _containsSpoilers,
            intent: _selectedIntent,
          );

      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Published review for "$_movieTitle"!'),
          backgroundColor: AppColors.accent,
        ),
      );
      navigator.pop(true);
    } catch (e) {
      setState(() => _isSubmitting = false);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed to post review: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CineAppBar(title: 'Write Film Review'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Movie header card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  if (_moviePoster != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.network(
                        'https://image.tmdb.org/t/p/w200$_moviePoster',
                        width: 48,
                        height: 72,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            const Icon(Icons.movie, size: 28),
                      ),
                    ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _movieTitle,
                          style: const TextStyle(
                            fontFamily: 'Georgia',
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (_movieReleaseYear != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            '$_movieReleaseYear',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Rating Stars
            const Text(
              'Your Rating',
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starVal = index + 1.0;
                final isSelected = _rating >= starVal;
                return IconButton(
                  iconSize: 36,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  icon: Icon(
                    isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: isSelected ? AppColors.star : AppColors.textMuted.withValues(alpha: 0.4),
                  ),
                  onPressed: () => setState(() => _rating = starVal),
                );
              }),
            ),
            Center(
              child: Text(
                '${_rating.toStringAsFixed(1)} / 5.0 Stars',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.star,
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Review Intent selector
            const Text(
              'Review Style & Focus',
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Select how you want to frame this critique for the community',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ReviewIntent.values.map((intent) {
                final isSelected = _selectedIntent == intent;
                return ChoiceChip(
                  label: Text(intent.label),
                  selected: isSelected,
                  selectedColor: AppColors.accent,
                  backgroundColor: AppColors.surface,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? AppColors.background : AppColors.textSecondary,
                  ),
                  onSelected: (val) {
                    if (val) setState(() => _selectedIntent = intent);
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Review Body Text Field
            const Text(
              'Review',
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _reviewController,
              maxLines: 8,
              decoration: const InputDecoration(
                hintText: 'Share your cinematic analysis, thoughts on direction, cinematography, performances, or personal takeaways...',
                alignLabelWithHint: true,
              ),
            ),

            const SizedBox(height: 16),

            // Spoiler Switch
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: SwitchListTile(
                title: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.warning),
                    const SizedBox(width: 8),
                    const Text('Contains Plot Spoilers', style: TextStyle(fontSize: 14)),
                  ],
                ),
                subtitle: const Text(
                  'Adds a spoiler blur to protect other viewers who haven\'t seen it',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
                value: _containsSpoilers,
                activeThumbColor: AppColors.accent,
                onChanged: (val) => setState(() => _containsSpoilers = val),
              ),
            ),

            const SizedBox(height: 28),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReview,
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
                        'Publish Review',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
