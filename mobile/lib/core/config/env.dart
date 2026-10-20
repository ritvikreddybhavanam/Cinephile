import 'package:flutter/foundation.dart';

/// Centralized environment configuration for the Cinephile application.
/// Supports local Android emulator, physical Android phone on Wi-Fi, and web/desktop.
class Env {
  Env._();

  static const int defaultPort = 8080;
  static const int defaultMlPort = 8000;

  static String? _customHost;
  static String? _customBaseUrl;

  /// Dynamic runtime override for API host (e.g. '192.168.0.5' or '10.0.2.2')
  static void setCustomHost(String? host) {
    _customHost = host?.trim();
  }

  /// Dynamic runtime override for full base URL
  static void setCustomBaseUrl(String? url) {
    _customBaseUrl = url?.trim().replaceAll(RegExp(r'/+$'), '');
  }

  /// Active Hostname based on runtime target and configuration

  static String get host {
    if (_customHost != null && _customHost!.isNotEmpty) {
      return _customHost!;
    }

    const dartDefineHost = String.fromEnvironment('HOST_IP');
    if (dartDefineHost.isNotEmpty) {
      return dartDefineHost;
    }

    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      const dartDefineUrl = String.fromEnvironment('API_BASE_URL');

      if (dartDefineUrl.isNotEmpty) {
        final uri = Uri.tryParse(dartDefineUrl);
        if (uri != null && uri.host.isNotEmpty) {
          return uri.host;
        }
      }

      // Physical phone connected to the same Wi-Fi as the laptop.
      return '192.168.0.5';
    }

    return 'localhost';
  }


  /// Spring Boot REST API Base URL
  static String get apiBaseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!.endsWith('/api')
          ? _customBaseUrl!
          : '$_customBaseUrl/api';
    }

    const dartDefineUrl = String.fromEnvironment('API_BASE_URL');
    if (dartDefineUrl.isNotEmpty) {
      return dartDefineUrl.endsWith('/api')
          ? dartDefineUrl
          : '$dartDefineUrl/api';
    }

    return 'http://$host:$defaultPort/api';
  }

  /// Python FastAPI Machine Learning Service Base URL
  static String get mlBaseUrl {
    const dartDefineMlUrl = String.fromEnvironment('ML_API_URL');
    if (dartDefineMlUrl.isNotEmpty) {
      return dartDefineMlUrl.replaceAll(RegExp(r'/+$'), '');
    }
    return 'http://$host:$defaultMlPort';
  }

  /// TMDB Image Base URLs
  static const String tmdbImageBase = 'https://image.tmdb.org/t/p';

  static String? posterUrl(String? posterPath, {int width = 500}) {
    if (posterPath == null || posterPath.trim().isEmpty) return null;
    final path = posterPath.startsWith('/') ? posterPath : '/$posterPath';
    return '$tmdbImageBase/w$width$path';
  }

  static String? backdropUrl(String? backdropPath) {
    if (backdropPath == null || backdropPath.trim().isEmpty) return null;
    final path = backdropPath.startsWith('/') ? backdropPath : '/$backdropPath';
    return '$tmdbImageBase/original$path';
  }

  static String? profileUrl(String? profilePath) {
    if (profilePath == null || profilePath.trim().isEmpty) return null;
    final path = profilePath.startsWith('/') ? profilePath : '/$profilePath';
    return '$tmdbImageBase/w185$path';
  }

  static String youtubeThumbnail(String key) =>
      'https://img.youtube.com/vi/$key/hqdefault.jpg';
}
