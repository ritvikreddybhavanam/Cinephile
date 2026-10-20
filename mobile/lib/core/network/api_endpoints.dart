/// Constant endpoint paths matching the Cinephile Spring Boot backend.
class ApiEndpoints {
  ApiEndpoints._();

  // Auth endpoints
  static const String authLogin = '/auth/login';
  static const String authVerifyEmail = '/auth/verify-email';

  // TMDB Proxy endpoints (Public)
  static const String tmdbTrending = '/tmdb/trending';
  static const String tmdbPopular = '/tmdb/popular';
  static const String tmdbMovies = '/tmdb/movies';
  static const String tmdbSearch = '/tmdb/search';
  static const String tmdbGenres = '/tmdb/genres';
  static const String tmdbLanguages = '/tmdb/languages';
  static const String tmdbTopMovies = '/tmdb/movies/top';
  static const String tmdbWatchProviders = '/tmdb/watch/providers';
  static const String tmdbPopularPeople = '/tmdb/people/popular';
  static const String tmdbSearchPeople = '/tmdb/people/search';

  static String tmdbMovieDetails(int id) => '/tmdb/movies/$id';
  static String tmdbMovieVideos(int id) => '/tmdb/movies/$id/videos';
  static String tmdbMovieCredits(int id) => '/tmdb/movies/$id/credits';
  static String tmdbMovieReviews(int id) => '/tmdb/movies/$id/reviews';
  static String tmdbMovieRecommendations(int id) => '/tmdb/movies/$id/recommendations';
  static String tmdbMovieSimilar(int id) => '/tmdb/movies/$id/similar';
  static String tmdbMovieWatchProviders(int id) => '/tmdb/movies/$id/watch/providers';
  static String tmdbMovieImages(int id) => '/tmdb/movies/$id/images';
  static String tmdbMovieKeywords(int id) => '/tmdb/movies/$id/keywords';
  static String tmdbMovieReleaseDates(int id) => '/tmdb/movies/$id/release_dates';
  static String tmdbPersonDetails(int id) => '/tmdb/person/$id';
  static String tmdbPersonCredits(int id) => '/tmdb/person/$id/credits';

  // Liked Movies (Auth)
  static const String likedMovies = '/liked-movies';
  static String likedMovie(int id) => '/liked-movies/$id';
  static String likedMovieStatus(int id) => '/liked-movies/$id/status';

  // Watchlist (Auth)
  static const String watchlist = '/watchlist';
  static String watchlistMovie(int id) => '/watchlist/$id';
  static String watchlistCheck(int id) => '/watchlist/check/$id';

  // Watched Movies (Auth)
  static const String watched = '/watched';
  static String watchedMovie(int id) => '/watched/$id';
  static String watchedCheck(int id) => '/watched/check/$id';

  // Diary (Auth)
  static const String diary = '/diary';
  static const String diaryMonth = '/diary/month';
  static const String diaryYears = '/diary/years';
  static const String diaryStats = '/diary/stats';
  static String diaryEntry(int id) => '/diary/$id';

  // Reviews (Auth / Public)
  static const String reviews = '/reviews';
  static const String reviewsMy = '/reviews/my';
  static String reviewsByMovie(int id) => '/reviews/movie/$id';
  static String reviewDetails(int id) => '/reviews/$id';
  static String reviewLikes(int id) => '/reviews/$id/likes';
  static String reviewComments(int id) => '/reviews/$id/comments';
  static String reviewCommentDelete(int reviewId, int commentId) =>
      '/reviews/$reviewId/comments/$commentId';

  // Lists (Auth / Public)
  static const String listsMy = '/lists/my';
  static const String listsPublic = '/lists/public';
  static const String lists = '/lists';
  static String listDetails(int id) => '/lists/$id';
  static String listMovie(int listId, int movieId) => '/lists/$listId/movies/$movieId';

  // Social (Auth / Public)
  static const String socialFeed = '/social/feed';
  static const String socialGlobalFeed = '/social/global-feed';
  static String socialFollow(int userId) => '/social/follow/$userId';
  static String socialIsFollowing(int userId) => '/social/is-following/$userId';
  static String socialFollowers(int userId) => '/social/followers/$userId';
  static String socialFollowing(int userId) => '/social/following/$userId';
  static String socialCounts(int userId) => '/social/counts/$userId';

  // User & Profile
  static const String userProfile = '/users/profile';
  static String userPublicProfile(int id) => '/users/$id';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static const String notificationsReadAll = '/notifications/read-all';
  static const String notificationsClear = '/notifications/clear';
  static String notificationRead(int id) => '/notifications/$id/read';
  static String notificationDelete(int id) => '/notifications/$id';

  // CineMatch
  static const String cineMatchCreate = '/cinematch/create';
  static String cineMatchJoin(String roomCode) => '/cinematch/join/$roomCode';
  static String cineMatchRoom(String roomCode) => '/cinematch/room/$roomCode';
  static String cineMatchStart(String roomCode) => '/cinematch/room/$roomCode/start';
  static String cineMatchSwipe(String roomCode) => '/cinematch/room/$roomCode/swipe';
  static String cineMatchReset(String roomCode) => '/cinematch/room/$roomCode/reset';

  // Prediction (Box office ML)
  static const String prediction = '/prediction/predict';

  // Content Guide & Advisory
  static String contentGuide(int movieId) => '/content-guide/movie/$movieId';
  static const String contentAdvisory = '/content-guide/advisory';

  // Data Migration
  static const String dataImportCsv = '/data/import/csv';
  static const String dataImportBatch = '/data/import/batch';
  static String dataExport(String type) => '/data/export/$type';
}
