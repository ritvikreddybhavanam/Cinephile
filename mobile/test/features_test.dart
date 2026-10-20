import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/routing/app_router.dart';
import 'package:mobile/core/routing/route_names.dart';
import 'package:mobile/models/content_advisory.dart';
import 'package:mobile/models/film_log.dart';
import 'package:mobile/models/liked_movie.dart';
import 'package:mobile/models/movie_list.dart';
import 'package:mobile/models/notification_item.dart';
import 'package:mobile/models/review.dart';
import 'package:mobile/models/social_activity.dart';
import 'package:mobile/models/watch_provider.dart';
import 'package:mobile/models/watched_movie.dart';
import 'package:mobile/models/watchlist_item.dart';

void main() {
  group('FilmLog Model Tests', () {
    test('Parses FilmLog JSON and formats dates correctly', () {
      final json = {
        'id': 101,
        'movieId': 550,
        'title': 'Fight Club',
        'releaseYear': 1999,
        'posterPath': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        'watchedDate': '2026-10-15',
        'rating': 4.5,
        'reviewText': 'An absolute masterpiece of psychological satire.',
        'containsSpoilers': true,
        'isRewatch': true,
        'loggedLocation': 'IMAX Cinema',
        'companionName': 'Tyler',
      };

      final log = FilmLog.fromJson(json);
      expect(log.id, 101);
      expect(log.movieId, 550);
      expect(log.title, 'Fight Club');
      expect(log.rating, 4.5);
      expect(log.containsSpoilers, isTrue);
      expect(log.isRewatch, isTrue);
      expect(log.loggedLocation, 'IMAX Cinema');
      expect(log.companionName, 'Tyler');
      expect(log.formattedWatchedDate, contains('15'));
      expect(log.posterUrl, isNotNull);
    });
  });

  group('Library & Watchlist Models Tests', () {
    test('WatchlistItem parses correctly', () {
      final json = {
        'id': 1,
        'movieId': 157336,
        'title': 'Interstellar',
        'poster': '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'addedAt': '2026-10-10T12:00:00Z',
      };
      final item = WatchlistItem.fromJson(json);
      expect(item.movieId, 157336);
      expect(item.title, 'Interstellar');
      expect(item.posterUrl, contains('image.tmdb.org'));
    });

    test('LikedMovie parses correctly', () {
      final json = {
        'id': 42,
        'movieId': 27205,
        'title': 'Inception',
        'poster': '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        'rating': 5.0,
        'likedAt': '2026-10-01T08:00:00Z',
      };
      final fav = LikedMovie.fromJson(json);
      expect(fav.movieId, 27205);
      expect(fav.title, 'Inception');
      expect(fav.rating, 5.0);
    });

    test('WatchedMovie parses correctly', () {
      final json = {
        'id': 7,
        'movieId': 680,
        'title': 'Pulp Fiction',
        'poster': '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        'year': 1994,
        'service': 'Netflix',
        'rating': 5.0,
      };
      final watched = WatchedMovie.fromJson(json);
      expect(watched.movieId, 680);
      expect(watched.service, 'Netflix');
      expect(watched.posterUrl, isNotNull);
    });
  });

  group('Review & Intent Tests', () {
    test('Review intent mapping and spoiler flag', () {
      final json = {
        'id': 50,
        'movieId': 11,
        'title': 'Star Wars',
        'rating': 4.0,
        'reviewText': 'The original space opera.',
        'containsSpoilers': false,
        'intentCategory': 'Deep Analysis',
        'user': {'id': 1, 'username': 'film_critic'},
      };

      final review = Review.fromJson(json);
      expect(review.movieId, 11);
      expect(review.movieTitle, 'Star Wars');
      expect(review.username, 'film_critic');
      expect(review.intent, ReviewIntent.deepAnalysis);
      expect(review.intentCategory, 'Deep Analysis');
      expect(review.containsSpoilers, isFalse);
    });
  });

  group('Curated Lists & Community Tests', () {
    test('MovieList parses author and movies count', () {
      final json = {
        'id': 12,
        'name': 'Noir Classics',
        'description': 'Dark alleys and cynical detectives.',
        'isPrivate': false,
        'user': {'username': 'bogart_fan'},
        'movieCount': 10,
        'movies': [],
      };
      final list = MovieList.fromJson(json);
      expect(list.name, 'Noir Classics');
      expect(list.authorName, 'bogart_fan');
      expect(list.movieCount, 10);
      expect(list.isPrivate, isFalse);
    });

    test('SocialActivity parses and creates action description', () {
      final json = {
        'id': 1,
        'userId': 2,
        'username': 'cine_alex',
        'actionType': 'LOG',
        'movieId': 550,
        'movieTitle': 'Fight Club',
        'rating': 5.0,
      };
      final activity = SocialActivity.fromJson(json);
      expect(activity.username, 'cine_alex');
      expect(activity.actionDescription, 'logged in Film Diary');
    });

    test('NotificationItem parses unread status', () {
      final json = {
        'id': 99,
        'title': 'New Follower',
        'message': 'Jane is now following your diary screenings.',
        'type': 'FOLLOW',
        'isRead': false,
      };
      final item = NotificationItem.fromJson(json);
      expect(item.id, 99);
      expect(item.isRead, isFalse);
      expect(item.type, 'FOLLOW');
    });

    test('ContentAdvisory and WatchProvider models', () {
      final advisoryJson = {
        'category': 'Violence',
        'label': 'Stylized Action Violence',
        'severity': 'MODERATE',
        'emoji': '💥',
      };
      final advisory = ContentAdvisory.fromJson(advisoryJson);
      expect(advisory.category, 'Stylized Action Violence');
      expect(advisory.severity, 'MODERATE');

      final providerJson = {
        'provider_id': 8,
        'provider_name': 'Netflix',
        'logo_path': '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
      };
      final provider = WatchProvider.fromJson(providerJson);
      expect(provider.name, 'Netflix');
      expect(provider.providerName, 'Netflix');
    });
  });

  group('App Router Tests', () {
    test('Generates routes for all main features without exception', () {
      final routesToTest = [
        RouteNames.main,
        RouteNames.home,
        RouteNames.discover,
        RouteNames.trending,
        RouteNames.newReleases,
        RouteNames.genres,
        RouteNames.languages,
        RouteNames.streamingGuide,
        RouteNames.whatToWatch,
        RouteNames.boxOffice,
        RouteNames.favorites,
        RouteNames.watchlist,
        RouteNames.watchedFilms,
        RouteNames.diary,
        RouteNames.analytics,
        RouteNames.myReviews,
        RouteNames.socialFeed,
        RouteNames.notifications,
        RouteNames.curatedLists,
        RouteNames.cinematch,
        RouteNames.people,
        RouteNames.profile,
        RouteNames.dataMigration,
        RouteNames.about,
        RouteNames.communityGuidelines,
        RouteNames.privacy,
        RouteNames.terms,
        RouteNames.login,
        RouteNames.register,
      ];

      for (final route in routesToTest) {
        final generated = AppRouter.generateRoute(RouteSettings(name: route));
        expect(generated, isA<MaterialPageRoute>());
      }
    });
  });
}
