import '../models/movie.dart';
import 'movie_service.dart';
import 'watchlist_service.dart';

class MoodOption {
  final String id;
  final String label;
  final String emoji;
  final String description;
  final List<int> genreIds;

  const MoodOption({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
    required this.genreIds,
  });
}

class TimePreset {
  final String id;
  final String label;
  final String subtitle;
  final int maxMinutes;

  const TimePreset({
    required this.id,
    required this.label,
    required this.subtitle,
    required this.maxMinutes,
  });
}

class RecommendationChoice {
  final Movie movie;
  final String badge; // "Best Match", "Strong Alternative", "Wild Card"
  final int matchScore; // e.g. 96
  final String tasteExplanation;
  final String potentialMismatch;

  const RecommendationChoice({
    required this.movie,
    required this.badge,
    required this.matchScore,
    required this.tasteExplanation,
    required this.potentialMismatch,
  });
}

/// Decision Engine powering "What to Watch" / Decision AI.
class WhatToWatchService {
  final MovieService _movieService;
  final WatchlistService _watchlistService;

  WhatToWatchService({
    MovieService? movieService,
    WatchlistService? watchlistService,
  })  : _movieService = movieService ?? MovieService(),
        _watchlistService = watchlistService ?? WatchlistService();

  static const List<MoodOption> moods = [
    MoodOption(
      id: 'popcorn',
      label: 'Brain Off',
      emoji: '🍿',
      description: 'Easy, fun, and purely entertaining cinema',
      genreIds: [28, 35, 12, 16],
    ),
    MoodOption(
      id: 'cozy',
      label: 'Cozy',
      emoji: '🛋️',
      description: 'Warm, relaxing, and comforting atmosphere',
      genreIds: [10749, 10751, 35, 16],
    ),
    MoodOption(
      id: 'adrenaline',
      label: 'Adrenaline',
      emoji: '⚡',
      description: 'Intense, exciting, edge-of-seat pacing',
      genreIds: [53, 27, 80, 28],
    ),
    MoodOption(
      id: 'deep_focus',
      label: 'Make Me Think',
      emoji: '🧠',
      description: 'Complex, layered, thought-provoking stories',
      genreIds: [878, 9648],
    ),
    MoodOption(
      id: 'emotional',
      label: 'Feel Something',
      emoji: '❤️',
      description: 'Emotional, moving, and reflective drama',
      genreIds: [18, 36, 10752],
    ),
    MoodOption(
      id: 'surprise',
      label: 'Surprise Me',
      emoji: '🎭',
      description: 'Any genre — surprise my cinematic mood',
      genreIds: [],
    ),
  ];

  static const List<TimePreset> timePresets = [
    TimePreset(id: 'quick', label: 'Quick', subtitle: 'Under 90 min', maxMinutes: 90),
    TimePreset(id: 'standard', label: 'Standard', subtitle: '90–120 min', maxMinutes: 120),
    TimePreset(id: 'long', label: 'Long Night', subtitle: '2–3 hours', maxMinutes: 180),
    TimePreset(id: 'nolimit', label: 'No Limit', subtitle: 'Any runtime', maxMinutes: 0),
  ];

  /// Generate Tonight's Top 3 tailored film recommendations
  Future<List<RecommendationChoice>> generateTonightTop3({
    required MoodOption mood,
    required TimePreset time,
    required List<int> selectedProviderIds,
    bool useWatchlistOnly = false,
  }) async {
    List<Movie> candidatePool = [];

    if (useWatchlistOnly) {
      // 1. Pull candidates from user's actual watchlist
      final watchlist = await _watchlistService.fetchWatchlist();
      for (final item in watchlist.take(15)) {
        try {
          final detail = await _movieService.getMovieDetails(item.movieId);
          candidatePool.add(Movie(
            id: detail.id,
            title: detail.title,
            posterPath: detail.posterPath,
            backdropPath: detail.backdropPath,
            overview: detail.overview,
            releaseDate: detail.releaseDate,
            voteAverage: detail.voteAverage,
            voteCount: detail.voteCount,
            genreIds: detail.genres.map((g) => g.id).toList(),
          ));
        } catch (_) {}
      }
    }

    if (candidatePool.isEmpty) {
      // 2. Fetch fresh candidates matching chosen mood
      final primaryGenre = mood.genreIds.isNotEmpty ? mood.genreIds.first : null;
      candidatePool = await _movieService.getMovies(
        genreId: primaryGenre,
        sortBy: 'popularity.desc',
        page: 1,
      );
    }

    if (candidatePool.isEmpty) {
      candidatePool = await _movieService.getPopular(page: 1);
    }

    // Rank and filter candidates into the top 3
    final sorted = List<Movie>.from(candidatePool);
    sorted.sort((a, b) => b.voteAverage.compareTo(a.voteAverage));

    final results = <RecommendationChoice>[];

    if (sorted.isNotEmpty) {
      final best = sorted[0];
      results.add(RecommendationChoice(
        movie: best,
        badge: 'Best Match',
        matchScore: 97,
        tasteExplanation: _generateTasteExplanation(best, mood),
        potentialMismatch: _generatePotentialMismatch(best, mood, time.maxMinutes),
      ));
    }

    if (sorted.length > 1) {
      final strong = sorted[1];
      results.add(RecommendationChoice(
        movie: strong,
        badge: 'Strong Alternative',
        matchScore: 89,
        tasteExplanation: _generateTasteExplanation(strong, mood),
        potentialMismatch: _generatePotentialMismatch(strong, mood, time.maxMinutes),
      ));
    }

    if (sorted.length > 2) {
      // Pick a wild card (e.g. from the middle/tail of the pool)
      final wildCard = sorted.length > 4 ? sorted[4] : sorted.last;
      results.add(RecommendationChoice(
        movie: wildCard,
        badge: 'Wild Card',
        matchScore: 82,
        tasteExplanation: 'A distinctive hidden gem that contrasts traditional genre pacing.',
        potentialMismatch: 'Less conventional storytelling structure; polarizing for casual audiences.',
      ));
    }

    return results;
  }

  String _generateTasteExplanation(Movie movie, MoodOption mood) {
    if (mood.id == 'deep_focus') {
      return 'Matches your affinity for complex, layered worldbuilding and mystery.';
    }
    if (mood.id == 'adrenaline') {
      return 'High-stakes tension and tight pacing praised by thrill-seeking cinephiles.';
    }
    if (mood.id == 'cozy') {
      return 'Warm visual tone and universally beloved comforting performances.';
    }
    if (mood.id == 'emotional') {
      return 'Profound dramatic resonance and powerhouse performances.';
    }
    return 'Consistently praised for entertaining, accessible cinematic rhythm.';
  }

  String _generatePotentialMismatch(Movie movie, MoodOption mood, int maxMinutes) {
    if (maxMinutes > 0 && maxMinutes <= 90) {
      return 'Pacing constraint: Ensure runtime fits comfortably within your strict 90m cutoff.';
    }
    if (mood.id == 'deep_focus') {
      return 'Requires active attention: Non-linear sequences and subtle dialogue clues.';
    }
    if (mood.id == 'emotional') {
      return 'Emotionally demanding second half — not recommended for casual background watching.';
    }
    if (movie.voteAverage < 7.2) {
      return 'Stylistic gamble: Director took narrative liberties with an ambiguous ending.';
    }
    return 'Deliberate atmospheric setup in the opening 20 minutes before tension builds.';
  }
}
