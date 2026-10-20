import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/routing/app_router.dart';
import 'core/routing/route_names.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';
import 'services/auth_service.dart';
import 'services/diary_service.dart';
import 'services/favorite_service.dart';
import 'services/list_service.dart';
import 'services/notification_service.dart';
import 'services/review_service.dart';
import 'services/social_service.dart';
import 'services/user_service.dart';
import 'services/watched_service.dart';
import 'services/watchlist_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style matching Midnight Cinema dark background
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.background,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final authService = AuthService();
  await authService.initSession();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthService>.value(value: authService),
        ChangeNotifierProvider<WatchlistService>(create: (_) => WatchlistService()),
        ChangeNotifierProvider<FavoriteService>(create: (_) => FavoriteService()),
        ChangeNotifierProvider<WatchedService>(create: (_) => WatchedService()),
        ChangeNotifierProvider<DiaryService>(create: (_) => DiaryService()),
        ChangeNotifierProvider<ReviewService>(create: (_) => ReviewService()),
        ChangeNotifierProvider<SocialService>(create: (_) => SocialService()),
        ChangeNotifierProvider<UserService>(create: (_) => UserService()),
        ChangeNotifierProvider<ListService>(create: (_) => ListService()),
        ChangeNotifierProvider<NotificationService>(create: (_) => NotificationService()),
      ],
      child: const CinephileApp(),
    ),
  );
}

class CinephileApp extends StatelessWidget {
  const CinephileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cinephile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      initialRoute: RouteNames.main,
      onGenerateRoute: AppRouter.generateRoute,
    );
  }
}
