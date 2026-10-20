import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/routing/route_names.dart';
import '../core/theme/app_colors.dart';
import '../services/auth_service.dart';

/// Navigation Drawer providing direct access to all Cinephile features and settings.
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;
    final isAuthenticated = authService.isAuthenticated;

    return Drawer(
      backgroundColor: AppColors.background,
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              bottom: 20,
              left: 20,
              right: 20,
            ),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(
                bottom: BorderSide(color: AppColors.border, width: 1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.movie_filter_rounded,
                        color: AppColors.accent,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'CINEPHILE',
                      style: TextStyle(
                        fontFamily: 'Georgia',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.accent,
                        letterSpacing: 2.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (isAuthenticated && user != null) ...[
                  Text(
                    user.displayName,
                    style: const TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user.email,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ] else ...[
                  const Text(
                    'The Cinema Companion',
                    style: TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).pushNamed(RouteNames.login);
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    child: const Text('Sign In / Register', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ],
            ),
          ),

          // Drawer Links
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _buildSectionHeader('DISCOVERY'),
                _buildTile(context, Icons.movie_outlined, 'Home & Cinema', RouteNames.home),
                _buildTile(context, Icons.explore_outlined, 'Discover & Search', RouteNames.discover),
                _buildTile(context, Icons.trending_up_rounded, 'Trending Today', RouteNames.trending),
                _buildTile(context, Icons.new_releases_outlined, 'New Releases', RouteNames.newReleases),
                _buildTile(context, Icons.category_outlined, 'Browse Genres', RouteNames.genres),
                _buildTile(context, Icons.language_rounded, 'World Cinema Languages', RouteNames.languages),

                const Divider(color: AppColors.border, height: 16),
                _buildSectionHeader('DECISION ENGINES'),
                _buildTile(context, Icons.tv_rounded, 'Streaming Guide', RouteNames.streamingGuide),
                _buildTile(context, Icons.psychology_outlined, 'What to Watch Algorithm', RouteNames.whatToWatch),
                _buildTile(context, Icons.analytics_outlined, 'Box Office ML Predictor', RouteNames.boxOffice),

                const Divider(color: AppColors.border, height: 16),
                _buildSectionHeader('YOUR ARCHIVE'),
                _buildTile(context, Icons.bookmark_border_rounded, 'Watchlist', RouteNames.watchlist),
                _buildTile(context, Icons.favorite_border_rounded, 'Favorites', RouteNames.favorites),
                _buildTile(context, Icons.check_circle_outline, 'Watched Films', RouteNames.watchedFilms),
                _buildTile(context, Icons.auto_stories_outlined, 'Film Diary', RouteNames.diary),
                _buildTile(context, Icons.auto_awesome_rounded, 'Cinematic Analytics & Wrapped', RouteNames.analytics),

                const Divider(color: AppColors.border, height: 16),
                _buildSectionHeader('COMMUNITY'),
                _buildTile(context, Icons.dynamic_feed_rounded, 'Activity Feed', RouteNames.socialFeed),
                _buildTile(context, Icons.favorite_rounded, 'CineMatch Swiping', RouteNames.cinematch),
                _buildTile(context, Icons.featured_play_list_outlined, 'Curated Lists', RouteNames.curatedLists),
                _buildTile(context, Icons.rate_review_outlined, 'My Reviews', RouteNames.myReviews),
                _buildTile(context, Icons.notifications_none_rounded, 'Notifications', RouteNames.notifications),
                _buildTile(context, Icons.people_outline_rounded, 'Directors & Actors', RouteNames.people),

                const Divider(color: AppColors.border, height: 16),
                _buildSectionHeader('SETTINGS & LEGAL'),
                _buildTile(context, Icons.swap_horiz_rounded, 'Data Migration (Letterboxd)', RouteNames.dataMigration),
                _buildTile(context, Icons.info_outline_rounded, 'About & Legal', RouteNames.about),

                if (isAuthenticated) ...[
                  const Divider(color: AppColors.border, height: 16),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                    title: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontSize: 13)),
                    onTap: () async {
                      Navigator.of(context).pop();
                      await authService.logout();
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, top: 12, bottom: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.textMuted,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildTile(BuildContext context, IconData icon, String title, String route) {
    return ListTile(
      dense: true,
      leading: Icon(icon, color: AppColors.textSecondary, size: 20),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
      ),
      onTap: () {
        Navigator.of(context).pop(); // Close drawer
        Navigator.of(context).pushNamed(route);
      },
    );
  }
}
