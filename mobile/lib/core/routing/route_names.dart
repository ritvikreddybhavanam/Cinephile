/// Application route names covering full feature parity with the Cinephile platform.
class RouteNames {
  RouteNames._();

  // Root & Navigation
  static const String main = '/';
  static const String home = '/home';
  static const String dashboard = '/dashboard';

  // Movies & Catalog
  static const String discover = '/discover';
  static const String movies = '/movies';
  static const String search = '/search';
  static const String movieDetails = '/movie-details';
  static const String trending = '/trending';
  static const String newReleases = '/new-releases';
  static const String genres = '/genres';
  static const String genreMovies = '/genre-movies';
  static const String languages = '/languages';
  static const String languageDetails = '/language-details';

  // Streaming & Decision Engine
  static const String streamingGuide = '/streaming-guide';
  static const String whatToWatch = '/what-to-watch';
  static const String boxOffice = '/box-office';

  // Library & Tracking
  static const String favorites = '/favorites';
  static const String watchlist = '/watchlist';
  static const String watchedFilms = '/watched-films';
  static const String diary = '/diary';
  static const String analytics = '/analytics';

  // Reviews & Social
  static const String writeReview = '/write-review';
  static const String myReviews = '/my-reviews';
  static const String socialFeed = '/social-feed';
  static const String notifications = '/notifications';
  static const String curatedLists = '/curated-lists';
  static const String listDetails = '/list-details';
  static const String cinematch = '/cinematch';

  // People & Profile
  static const String people = '/people';
  static const String personDetails = '/person-details';
  static const String profile = '/profile';
  static const String dataMigration = '/data-migration';

  // Information & Legal
  static const String about = '/about';
  static const String communityGuidelines = '/community-guidelines';
  static const String privacy = '/privacy';
  static const String terms = '/terms';

  // Auth
  static const String login = '/login';
  static const String register = '/register';
}
