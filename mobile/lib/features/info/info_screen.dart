import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/cine_app_bar.dart';

/// Screen displaying Cinephile About, Community Guidelines, Privacy Policy, and Terms of Service.
class InfoScreen extends StatefulWidget {
  final int initialTabIndex; // 0: About, 1: Guidelines, 2: Privacy, 3: Terms

  const InfoScreen({super.key, this.initialTabIndex = 0});

  @override
  State<InfoScreen> createState() => _InfoScreenState();
}

class _InfoScreenState extends State<InfoScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 4,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 3),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CineAppBar(
        title: 'Cinephile Information',
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppColors.accent,
          labelColor: AppColors.accent,
          unselectedLabelColor: AppColors.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: 'About'),
            Tab(text: 'Community Guidelines'),
            Tab(text: 'Privacy Policy'),
            Tab(text: 'Terms of Service'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAboutTab(),
          _buildGuidelinesTab(),
          _buildPrivacyTab(),
          _buildTermsTab(),
        ],
      ),
    );
  }

  Widget _buildAboutTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.movie_filter_rounded, size: 40, color: AppColors.accent),
            ),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'CINEPHILE',
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.accent,
                letterSpacing: 2.0,
              ),
            ),
          ),
          const Center(
            child: Text(
              'The Social Platform for Serious Film Lovers',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('Our Mission'),
          _buildParagraph(
            'Cinephile was created to give movie lovers an elegant, distraction-free home for logging screenings, discovering hidden gems, and engaging in thoughtful cinema discussion without corporate noise.',
          ),
          _buildSectionTitle('Machine Learning & Decision Engine'),
          _buildParagraph(
            'Powered by a custom ElasticNet machine-learning model, Cinephile predicts box-office revenue based on production budgets, genre combinations, star cast metrics, and runtime. Our "What to Watch" algorithm eliminates decision paralysis by scoring candidate films against your mood, available runtime, and viewing habits.',
          ),
          _buildSectionTitle('Data & Attribution'),
          _buildParagraph(
            'Film metadata, cast credits, imagery, and trailers are powered by the TMDB API. Cinephile is not endorsed or certified by TMDB.',
          ),
        ],
      ),
    );
  }

  Widget _buildGuidelinesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Respectful Critique'),
          _buildParagraph(
            'Cinema is deeply subjective. We encourage spirited analysis and passionate disagreement, but personal attacks, harassment, discrimination, or hate speech will result in immediate suspension.',
          ),
          _buildSectionTitle('Spoiler Etiquette'),
          _buildParagraph(
            'Always mark plot twists, endings, and narrative surprises with the "Contains Spoilers" toggle. Give your fellow cinephiles the joy of experiencing films untainted.',
          ),
          _buildSectionTitle('Authentic Reviews'),
          _buildParagraph(
            'Write original reviews. Plagiarized critiques from other publications or AI-generated spam will be removed by community moderators.',
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Data Ownership'),
          _buildParagraph(
            'Your film history, ratings, reviews, and diary logs belong entirely to you. You can export your full database anytime in standard CSV/JSON format.',
          ),
          _buildSectionTitle('Authentication Security'),
          _buildParagraph(
            'Passcards, emails, and credentials are encrypted using industry-standard Firebase security and JWT tokens. We never sell your personal viewing telemetry to third-party ad brokers.',
          ),
          _buildSectionTitle('Account Deletion'),
          _buildParagraph(
            'You may request complete account and data deletion at any time through account settings.',
          ),
        ],
      ),
    );
  }

  Widget _buildTermsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Terms of Use'),
          _buildParagraph(
            'By using Cinephile across web, Android, iOS, or other platforms, you agree to comply with our community standards and service terms.',
          ),
          _buildSectionTitle('User Generated Content'),
          _buildParagraph(
            'You retain copyright of reviews and lists created on Cinephile, while granting the platform a license to display them to community members.',
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          fontFamily: 'Georgia',
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildParagraph(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        color: AppColors.textSecondary,
        height: 1.5,
      ),
    );
  }
}
