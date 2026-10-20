import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/user_profile.dart';
import '../../services/auth_service.dart';
import '../../services/diary_service.dart';
import '../../services/favorite_service.dart';
import '../../services/social_service.dart';
import '../../services/user_service.dart';
import '../../services/watched_service.dart';
import '../../services/watchlist_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import 'edit_profile_dialog.dart';

/// Comprehensive User Profile screen featuring personal metrics, library stats, and settings.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, int> _socialCounts = {'followers': 0, 'following': 0};

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    final auth = context.read<AuthService>();
    if (!auth.isAuthenticated) return;

    final userId = auth.currentUser?.id ?? 0;
    await Future.wait([
      context.read<UserService>().fetchMyProfile(),
      context.read<WatchedService>().fetchWatchedMovies(),
      context.read<WatchlistService>().fetchWatchlist(),
      context.read<FavoriteService>().fetchFavorites(),
      context.read<DiaryService>().fetchDiary(),
    ]);

    if (userId > 0 && mounted) {
      final counts = await context.read<SocialService>().getCounts(userId);
      if (mounted) setState(() => _socialCounts = counts);
    }
  }

  Future<void> _openEditProfile(UserProfile? profile) async {
    final updated = await EditProfileDialog.show(context, profile: profile);
    if (updated == true && mounted) {
      _loadProfileData();
    }
  }

  Future<void> _confirmSignOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        title: const Text('Sign Out?'),
        content: const Text('Are you sure you want to sign out of Cinephile?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await context.read<AuthService>().logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    if (!authService.isAuthenticated) {
      return Scaffold(
        appBar: const CineAppBar(title: 'Profile'),
        body: CineEmptyView(
          title: 'Join the Cinephile Community',
          subtitle:
              'Sign in to curate your film library, log diary screenings, track statistics, and connect with fellow cinephiles.',
          icon: Icons.account_circle_outlined,
          action: ElevatedButton(
            onPressed: () => Navigator.of(context).pushNamed(RouteNames.login),
            child: const Text('Sign In or Register'),
          ),
        ),
      );
    }

    final userService = context.watch<UserService>();
    final profile = userService.profile;
    final user = authService.currentUser!;
    final watchedCount = context.watch<WatchedService>().watchedMovies.length;
    final watchlistCount = context.watch<WatchlistService>().watchlist.length;
    final favCount = context.watch<FavoriteService>().favorites.length;
    final diaryCount = context.watch<DiaryService>().diary.length;

    return Scaffold(
      appBar: CineAppBar(
        title: 'Cinephile Profile',
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppColors.textPrimary),
            tooltip: 'Data & Settings',
            onPressed: () => Navigator.of(context).pushNamed(RouteNames.dataMigration),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
            tooltip: 'Sign Out',
            onPressed: _confirmSignOut,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.surfaceElevated,
        onRefresh: _loadProfileData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 1. Avatar & Names
              CircleAvatar(
                radius: 46,
                backgroundColor: AppColors.surfaceElevated,
                backgroundImage: profile?.avatarUrl != null
                    ? NetworkImage(profile!.avatarUrl!)
                    : null,
                child: profile?.avatarUrl == null
                    ? Text(
                        (profile != null && profile.firstname.isNotEmpty)
                            ? profile.firstname[0].toUpperCase()
                            : (user.firstname.isNotEmpty ? user.firstname[0].toUpperCase() : 'C'),
                        style: const TextStyle(
                          fontFamily: 'Georgia',
                          fontSize: 34,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accent,
                        ),
                      )
                    : null,
              ),
              const SizedBox(height: 14),

              Text(
                profile?.displayName ?? user.displayName,
                style: const TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                (profile?.username?.isNotEmpty == true)
                    ? '@${profile!.username}'
                    : user.email,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.accent,
                  fontWeight: FontWeight.w500,
                ),
              ),

              if (profile != null && profile.bio != null && profile.bio!.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  profile.bio!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],

              // Location & Website tags
              if (profile != null &&
                  ((profile.location != null && profile.location!.isNotEmpty) ||
                      (profile.website != null && profile.website!.isNotEmpty))) ...[
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (profile.location != null && profile.location!.isNotEmpty) ...[
                      const Icon(Icons.place_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        profile.location!,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      const SizedBox(width: 12),
                    ],
                    if (profile.website != null && profile.website!.isNotEmpty) ...[
                      GestureDetector(
                        onTap: () async {
                          final uri = Uri.parse(profile.website!);
                          if (await canLaunchUrl(uri)) launchUrl(uri);
                        },
                        child: Row(
                          children: [
                            const Icon(Icons.link_rounded, size: 14, color: AppColors.accent),
                            const SizedBox(width: 4),
                            Text(
                              profile.website!,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.accent,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ],

              const SizedBox(height: 16),

              // Edit Profile Button
              OutlinedButton.icon(
                onPressed: () => _openEditProfile(profile),
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: const Text('Edit Profile', style: TextStyle(fontSize: 13)),
              ),

              const SizedBox(height: 24),

              // 2. Followers & Following
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildFollowMetric('Followers', _socialCounts['followers'] ?? 0),
                    Container(height: 28, width: 1, color: AppColors.border),
                    _buildFollowMetric('Following', _socialCounts['following'] ?? 0),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 3. Library Quick Stats Row
              Row(
                children: [
                  Expanded(
                    child: _buildStatTile(
                      label: 'Watched',
                      count: watchedCount,
                      icon: Icons.check_circle_outline,
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.watchedFilms),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatTile(
                      label: 'Watchlist',
                      count: watchlistCount,
                      icon: Icons.bookmark_border_rounded,
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.watchlist),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatTile(
                      label: 'Favorites',
                      count: favCount,
                      icon: Icons.favorite_border_rounded,
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.favorites),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatTile(
                      label: 'Diary',
                      count: diaryCount,
                      icon: Icons.auto_stories_outlined,
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.diary),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // 4. Favorite Genres Chips
              if (profile != null && profile.favoriteGenres.isNotEmpty) ...[
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Curated Taste Profile',
                    style: TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: profile.favoriteGenres.map((g) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          g,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accent,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // 5. Navigation Links List
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildNavItem(
                      icon: Icons.auto_awesome_rounded,
                      title: 'Cinematic Analytics & Wrapped',
                      subtitle: 'Viewing hours, ratings distribution & habits',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.analytics),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildNavItem(
                      icon: Icons.rate_review_outlined,
                      title: 'My Reviews & Critiques',
                      subtitle: 'Browse and manage all published film reviews',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.myReviews),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildNavItem(
                      icon: Icons.featured_play_list_outlined,
                      title: 'Curated Lists',
                      subtitle: 'Thematic collections and rankings',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.curatedLists),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildNavItem(
                      icon: Icons.people_outline_rounded,
                      title: 'Directors & Actors',
                      subtitle: 'Filmographies and popular cinephile talent',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.people),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildNavItem(
                      icon: Icons.swap_horiz_rounded,
                      title: 'Data Migration & Letterboxd Sync',
                      subtitle: 'Import or export your cinema archive',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.dataMigration),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildNavItem(
                      icon: Icons.info_outline_rounded,
                      title: 'About Cinephile & Legal',
                      subtitle: 'Community guidelines, terms & privacy',
                      onTap: () => Navigator.of(context).pushNamed(RouteNames.about),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFollowMetric(String label, int count) {
    return Column(
      children: [
        Text(
          '$count',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStatTile({
    required String label,
    required int count,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppColors.accent),
            const SizedBox(height: 6),
            Text(
              '$count',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.accent.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.accent, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
      onTap: onTap,
    );
  }
}
