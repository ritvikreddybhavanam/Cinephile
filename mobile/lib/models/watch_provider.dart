import '../core/config/env.dart';

/// Represents a streaming platform / watch provider (e.g. Netflix, Prime Video, Hotstar).
class WatchProvider {
  final int id;
  final String name;
  final String? logoPath;

  const WatchProvider({
    required this.id,
    required this.name,
    this.logoPath,
  });

  factory WatchProvider.fromJson(Map<String, dynamic> json) {
    return WatchProvider(
      id: (json['provider_id'] as num?)?.toInt() ?? (json['id'] as num?)?.toInt() ?? 0,
      name: json['provider_name'] as String? ?? json['name'] as String? ?? 'Streaming Service',
      logoPath: json['logo_path'] as String?,
    );
  }

  String? get logoUrl => Env.profileUrl(logoPath);

  String get providerName => name;
}

/// Container for streaming, rent, and buy providers
class MovieWatchProviders {
  final List<WatchProvider> flatrate;
  final List<WatchProvider> rent;
  final List<WatchProvider> buy;

  const MovieWatchProviders({
    this.flatrate = const [],
    this.rent = const [],
    this.buy = const [],
  });

  factory MovieWatchProviders.fromTmdbRegionJson(Map<String, dynamic>? regionData) {
    if (regionData == null) return const MovieWatchProviders();

    List<WatchProvider> parseList(dynamic rawList) {
      if (rawList is! List) return [];
      return rawList
          .whereType<Map<String, dynamic>>()
          .map((item) => WatchProvider.fromJson(item))
          .toList();
    }

    return MovieWatchProviders(
      flatrate: parseList(regionData['flatrate']),
      rent: parseList(regionData['rent']),
      buy: parseList(regionData['buy']),
    );
  }

  bool get hasAnyProvider => flatrate.isNotEmpty || rent.isNotEmpty || buy.isNotEmpty;

  List<WatchProvider> get flatStreamProviders => [...flatrate, ...rent, ...buy];
}
