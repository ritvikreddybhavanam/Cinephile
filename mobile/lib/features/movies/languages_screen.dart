import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying World Cinema categorized by Language.
class LanguagesScreen extends StatefulWidget {
  const LanguagesScreen({super.key});

  @override
  State<LanguagesScreen> createState() => _LanguagesScreenState();
}

class _LanguagesScreenState extends State<LanguagesScreen> {
  final MovieService _movieService = MovieService();
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _languages = [];

  static const Map<String, String> languageFlags = {
    'en': '🇺🇸',
    'hi': '🇮🇳',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ta': '🇮🇳',
    'te': '🇮🇳',
    'ml': '🇮🇳',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'zh': '🇨🇳',
    'pt': '🇵🇹',
    'ru': '🇷🇺',
  };

  @override
  void initState() {
    super.initState();
    _fetchLanguages();
  }

  Future<void> _fetchLanguages() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _movieService.getLanguages();
      setState(() {
        _languages = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'World Cinema'),
      body: _isLoading
          ? const CineLoadingIndicator(message: 'Loading international cinema...')
          : _errorMessage != null
              ? CineErrorView(message: _errorMessage!, onRetry: _fetchLanguages)
              : ListView.separated(
                  padding: EdgeInsets.symmetric(horizontal: padding, vertical: 12),
                  itemCount: _languages.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final item = _languages[index];
                    final code = item['iso_639_1'] as String? ?? 'en';
                    final englishName = item['english_name'] as String? ?? 'English';
                    final nativeName = item['name'] as String? ?? englishName;
                    final flag = languageFlags[code] ?? '🌐';

                    return InkWell(
                      onTap: () {
                        Navigator.of(context).pushNamed(
                          RouteNames.languageDetails,
                          arguments: {
                            'code': code,
                            'name': englishName,
                          },
                        );
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Text(flag, style: const TextStyle(fontSize: 22)),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    englishName,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  if (nativeName != englishName && nativeName.isNotEmpty) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      nativeName,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
