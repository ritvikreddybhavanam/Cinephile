import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie.dart';
import '../../services/what_to_watch_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';

/// Decision Engine: "What to Watch" Screen.
/// Filters candidates by available time, mood, and OTT providers into Tonight's Top 3.
class WhatToWatchScreen extends StatefulWidget {
  const WhatToWatchScreen({super.key});

  @override
  State<WhatToWatchScreen> createState() => _WhatToWatchScreenState();
}

class _WhatToWatchScreenState extends State<WhatToWatchScreen> {
  final WhatToWatchService _engine = WhatToWatchService();

  MoodOption _selectedMood = WhatToWatchService.moods.first;
  TimePreset _selectedTime = WhatToWatchService.timePresets[1];
  bool _useWatchlistOnly = false;

  bool _isGenerating = false;
  String? _errorMessage;
  List<RecommendationChoice>? _results;

  Future<void> _generateChoices() async {
    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      final choices = await _engine.generateTonightTop3(
        mood: _selectedMood,
        time: _selectedTime,
        selectedProviderIds: const [8, 119],
        useWatchlistOnly: _useWatchlistOnly,
      );

      setState(() {
        _results = choices;
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isGenerating = false;
      });
    }
  }

  void _openMovieDetails(Movie movie) {
    Navigator.of(context).pushNamed(RouteNames.movieDetails, arguments: movie.id);
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'What to Watch'),
      body: _isGenerating
          ? const CineLoadingIndicator(message: 'Decision AI analyzing catalog...')
          : _errorMessage != null
              ? CineErrorView(message: _errorMessage!, onRetry: _generateChoices)
              : _results != null
                  ? _buildResultsView(padding)
                  : _buildControlsForm(padding),
    );
  }

  Widget _buildControlsForm(double padding) {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: padding, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Film Decision Engine',
            style: TextStyle(
              fontFamily: 'Georgia',
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Tell us your mood and available time. We\'ll filter the noise down to Tonight\'s Top 3.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
          ),

          const SizedBox(height: 24),

          // 1. Available Time Window
          const Text(
            'Available Time',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accent),
          ),
          const SizedBox(height: 10),
          Row(
            children: WhatToWatchService.timePresets.map((t) {
              final isSelected = _selectedTime.id == t.id;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    onTap: () => setState(() => _selectedTime = t),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.accent.withValues(alpha: 0.15) : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isSelected ? AppColors.accent : AppColors.border),
                      ),
                      child: Column(
                        children: [
                          Text(
                            t.label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? AppColors.accent : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            t.subtitle,
                            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 24),

          // 2. Select Mood
          const Text(
            'Tonight\'s Mood & Vibe',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accent),
          ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.1,
            ),
            itemCount: WhatToWatchService.moods.length,
            itemBuilder: (context, index) {
              final m = WhatToWatchService.moods[index];
              final isSelected = _selectedMood.id == m.id;

              return InkWell(
                onTap: () => setState(() => _selectedMood = m),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.accent.withValues(alpha: 0.15) : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSelected ? AppColors.accent : AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Text(m.emoji, style: const TextStyle(fontSize: 22)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              m.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? AppColors.accent : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              m.description,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // 3. Watchlist Cleanser Switch
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.cleaning_services_rounded, color: AppColors.accent, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Watchlist Cleanser Mode',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      Text(
                        'Pick exclusively from films saved in your watchlist',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _useWatchlistOnly,
                  activeThumbColor: AppColors.accent,
                  onChanged: (val) => setState(() => _useWatchlistOnly = val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // Action button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _generateChoices,
              icon: const Icon(Icons.auto_awesome_rounded, size: 18),
              label: const Text('Find Tonight\'s 3 Films'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsView(double padding) {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: padding, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tonight\'s Top 3',
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton.icon(
                onPressed: () => setState(() => _results = null),
                icon: const Icon(Icons.tune_rounded, size: 16),
                label: const Text('Modify Filters'),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (_results != null)
            ..._results!.map((choice) => _buildChoiceCard(choice)),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _generateChoices,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Re-roll Recommendations'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChoiceCard(RecommendationChoice choice) {
    final movie = choice.movie;
    Color badgeColor = AppColors.accent;
    if (choice.badge.contains('Alternative')) badgeColor = AppColors.greenAccent;
    if (choice.badge.contains('Wild')) badgeColor = const Color(0xFFB57EDC);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: badgeColor.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge & Score
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: badgeColor),
                ),
                child: Text(
                  choice.badge,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: badgeColor),
                ),
              ),
              Text(
                '${choice.matchScore}% Taste Match',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.accent),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Film row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 70,
                  height: 105,
                  child: movie.posterUrl != null
                      ? Image.network(movie.posterUrl!, fit: BoxFit.cover)
                      : Container(color: AppColors.surface2),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      movie.title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${movie.year} · ★ ${movie.ratingFormatted}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      choice.tasteExplanation,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Honest Potential Mismatch Warning
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.textMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    choice.potentialMismatch,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted, height: 1.3),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Action Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _openMovieDetails(movie),
              child: const Text('View Film & Stream'),
            ),
          ),
        ],
      ),
    );
  }
}
