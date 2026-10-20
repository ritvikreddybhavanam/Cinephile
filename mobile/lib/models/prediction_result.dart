/// Box office prediction request sent to the Spring Boot / ML prediction service.
class PredictionRequest {
  final String title;
  final double budget;
  final double runtime;
  final int releaseYear;
  final int releaseMonth;
  final String originalLanguage;
  final String mainCountry;
  final List<String> genres;

  const PredictionRequest({
    required this.title,
    required this.budget,
    required this.runtime,
    required this.releaseYear,
    required this.releaseMonth,
    this.originalLanguage = 'en',
    this.mainCountry = 'United States of America',
    this.genres = const [],
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'budget': budget,
        'runtime': runtime,
        'releaseYear': releaseYear,
        'release_year': releaseYear,
        'releaseMonth': releaseMonth,
        'release_month': releaseMonth,
        'originalLanguage': originalLanguage,
        'original_language': originalLanguage,
        'mainCountry': mainCountry,
        'main_country': mainCountry,
        'genres': genres,
      };
}

/// Output returned by the Box Office Prediction machine learning pipeline.
class PredictionResult {
  final String title;
  final double predictedRevenue;
  final double predictedRevenueMillions;
  final double? roiPercentage;
  final String category;
  final String summary;

  const PredictionResult({
    required this.title,
    required this.predictedRevenue,
    required this.predictedRevenueMillions,
    this.roiPercentage,
    required this.category,
    required this.summary,
  });

  factory PredictionResult.fromJson(Map<String, dynamic> json, double budget) {
    double rev = 0.0;
    final rawRev = json['predictedRevenue'] ?? json['predicted_revenue'];
    if (rawRev is num) rev = rawRev.toDouble();

    double revM = 0.0;
    final rawRevM = json['predictedRevenueMillions'] ?? json['predicted_revenue_millions'];
    if (rawRevM is num) {
      revM = rawRevM.toDouble();
    } else {
      revM = rev / 1000000.0;
    }

    double? roi;
    if (budget > 0) {
      roi = ((rev - budget) / budget) * 100.0;
    }

    String cat = 'Moderate Success';
    if (roi != null) {
      if (roi > 200) {
        cat = 'Major Blockbuster';
      } else if (roi > 80) {
        cat = 'Highly Profitable';
      } else if (roi > 0) {
        cat = 'Moderate Commercial Success';
      } else {
        cat = 'Box Office Risk / Underperformer';
      }
    }

    return PredictionResult(
      title: json['title'] as String? ?? 'Film',
      predictedRevenue: rev,
      predictedRevenueMillions: revM,
      roiPercentage: roi,
      category: json['category'] as String? ?? cat,
      summary: json['summary'] as String? ??
          'Based on historical regression across runtime, budget scale, release window, and genre synergy.',
    );
  }
}
