import 'package:flutter/material.dart';
import '../../features/analytics/analytics_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/boxoffice/box_office_screen.dart';
import '../../features/cinematch/cinematch_screen.dart';
import '../../features/diary/diary_screen.dart';
import '../../features/info/info_screen.dart';
import '../../features/library/favorites_screen.dart';
import '../../features/library/watched_films_screen.dart';
import '../../features/library/watchlist_screen.dart';
import '../../features/lists/list_details_screen.dart';
import '../../features/lists/lists_screen.dart';
import '../../features/main_navigation_screen.dart';
import '../../features/movies/genre_movies_screen.dart';
import '../../features/movies/genres_screen.dart';
import '../../features/movies/language_details_screen.dart';
import '../../features/movies/languages_screen.dart';
import '../../features/movies/movie_details_screen.dart';
import '../../features/movies/movies_screen.dart';
import '../../features/movies/new_releases_screen.dart';
import '../../features/movies/trending_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/people/people_screen.dart';
import '../../features/people/person_details_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/recommendations/what_to_watch_screen.dart';
import '../../features/reviews/my_reviews_screen.dart';
import '../../features/reviews/write_review_screen.dart';
import '../../features/settings/data_migration_screen.dart';
import '../../features/social/activity_feed_screen.dart';
import '../../features/streaming/streaming_guide_screen.dart';
import '../../models/genre.dart';
import 'route_names.dart';

/// Central route generator for Cinephile mapping all 27+ mobile screens.
class AppRouter {
  AppRouter._();

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      // 1. Root & Shell
      case RouteNames.main:
      case RouteNames.home:
      case RouteNames.dashboard:
        return MaterialPageRoute(
          builder: (_) => const MainNavigationScreen(),
          settings: settings,
        );

      // 2. Movies Catalog
      case RouteNames.discover:
      case RouteNames.movies:
      case RouteNames.search:
        return MaterialPageRoute(
          builder: (_) => const MoviesScreen(),
          settings: settings,
        );

      case RouteNames.movieDetails:
        final movieId = settings.arguments as int? ?? 0;
        return MaterialPageRoute(
          builder: (_) => MovieDetailsScreen(movieId: movieId),
          settings: settings,
        );

      case RouteNames.trending:
        return MaterialPageRoute(
          builder: (_) => const TrendingScreen(),
          settings: settings,
        );

      case RouteNames.newReleases:
        return MaterialPageRoute(
          builder: (_) => const NewReleasesScreen(),
          settings: settings,
        );

      case RouteNames.genres:
        return MaterialPageRoute(
          builder: (_) => const GenresScreen(),
          settings: settings,
        );

      case RouteNames.genreMovies:
        final genre = settings.arguments as Genre? ??
            const Genre(id: 28, name: 'Action');
        return MaterialPageRoute(
          builder: (_) => GenreMoviesScreen(genre: genre),
          settings: settings,
        );

      case RouteNames.languages:
        return MaterialPageRoute(
          builder: (_) => const LanguagesScreen(),
          settings: settings,
        );

      case RouteNames.languageDetails:
        final args = settings.arguments as Map<String, dynamic>? ?? {};
        return MaterialPageRoute(
          builder: (_) => LanguageDetailsScreen(
            languageCode: args['code'] as String? ?? 'en',
            languageName: args['name'] as String? ?? 'English',
          ),
          settings: settings,
        );

      // 3. Streaming & Algorithms
      case RouteNames.streamingGuide:
        return MaterialPageRoute(
          builder: (_) => const StreamingGuideScreen(),
          settings: settings,
        );

      case RouteNames.whatToWatch:
        return MaterialPageRoute(
          builder: (_) => const WhatToWatchScreen(),
          settings: settings,
        );

      case RouteNames.boxOffice:
        return MaterialPageRoute(
          builder: (_) => const BoxOfficeScreen(),
          settings: settings,
        );

      // 4. Library & Personal Tracking
      case RouteNames.favorites:
        return MaterialPageRoute(
          builder: (_) => const FavoritesScreen(),
          settings: settings,
        );

      case RouteNames.watchlist:
        return MaterialPageRoute(
          builder: (_) => const WatchlistScreen(),
          settings: settings,
        );

      case RouteNames.watchedFilms:
        return MaterialPageRoute(
          builder: (_) => const WatchedFilmsScreen(),
          settings: settings,
        );

      case RouteNames.diary:
        return MaterialPageRoute(
          builder: (_) => const DiaryScreen(),
          settings: settings,
        );

      case RouteNames.analytics:
        return MaterialPageRoute(
          builder: (_) => const AnalyticsScreen(),
          settings: settings,
        );

      // 5. Reviews & Community
      case RouteNames.writeReview:
        return MaterialPageRoute(
          builder: (_) => WriteReviewScreen(movie: settings.arguments),
          settings: settings,
        );

      case RouteNames.myReviews:
        return MaterialPageRoute(
          builder: (_) => const MyReviewsScreen(),
          settings: settings,
        );

      case RouteNames.socialFeed:
        return MaterialPageRoute(
          builder: (_) => const ActivityFeedScreen(),
          settings: settings,
        );

      case RouteNames.notifications:
        return MaterialPageRoute(
          builder: (_) => const NotificationsScreen(),
          settings: settings,
        );

      case RouteNames.curatedLists:
        return MaterialPageRoute(
          builder: (_) => const ListsScreen(),
          settings: settings,
        );

      case RouteNames.listDetails:
        return MaterialPageRoute(
          builder: (_) => ListDetailsScreen(listOrId: settings.arguments),
          settings: settings,
        );

      case RouteNames.cinematch:
        return MaterialPageRoute(
          builder: (_) => const CineMatchScreen(),
          settings: settings,
        );

      // 6. People & Profile
      case RouteNames.people:
        return MaterialPageRoute(
          builder: (_) => const PeopleScreen(),
          settings: settings,
        );

      case RouteNames.personDetails:
        final personId = settings.arguments as int? ?? 0;
        return MaterialPageRoute(
          builder: (_) => PersonDetailsScreen(personId: personId),
          settings: settings,
        );

      case RouteNames.profile:
        return MaterialPageRoute(
          builder: (_) => const ProfileScreen(),
          settings: settings,
        );

      case RouteNames.dataMigration:
        return MaterialPageRoute(
          builder: (_) => const DataMigrationScreen(),
          settings: settings,
        );

      // 7. Information & Legal
      case RouteNames.about:
        return MaterialPageRoute(
          builder: (_) => const InfoScreen(initialTabIndex: 0),
          settings: settings,
        );

      case RouteNames.communityGuidelines:
        return MaterialPageRoute(
          builder: (_) => const InfoScreen(initialTabIndex: 1),
          settings: settings,
        );

      case RouteNames.privacy:
        return MaterialPageRoute(
          builder: (_) => const InfoScreen(initialTabIndex: 2),
          settings: settings,
        );

      case RouteNames.terms:
        return MaterialPageRoute(
          builder: (_) => const InfoScreen(initialTabIndex: 3),
          settings: settings,
        );

      // 8. Auth
      case RouteNames.login:
        return MaterialPageRoute(
          builder: (_) => const LoginScreen(),
          settings: settings,
        );

      case RouteNames.register:
        return MaterialPageRoute(
          builder: (_) => const RegisterScreen(),
          settings: settings,
        );

      default:
        return MaterialPageRoute(
          builder: (_) => const MainNavigationScreen(),
          settings: settings,
        );
    }
  }
}
