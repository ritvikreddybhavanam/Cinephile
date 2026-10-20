import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/prediction_result.dart';
import '../../services/prediction_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';

/// Machine Learning Box Office Prediction Screen.
class BoxOfficeScreen extends StatefulWidget {
  const BoxOfficeScreen({super.key});

  @override
  State<BoxOfficeScreen> createState() => _BoxOfficeScreenState();
}

class _BoxOfficeScreenState extends State<BoxOfficeScreen> {
  final _formKey = GlobalKey<FormState>();
  final PredictionService _predictionService = PredictionService();

  final _titleController = TextEditingController(text: 'Dune: Part Three');
  final _budgetController = TextEditingController(text: '165000000');
  final _runtimeController = TextEditingController(text: '160');
  int _releaseYear = 2026;
  int _releaseMonth = 11;
  final String _language = 'en';
  final String _country = 'United States of America';
  final Set<String> _selectedGenres = {'Science Fiction', 'Adventure', 'Drama'};

  bool _isPredicting = false;
  String? _errorMessage;
  PredictionResult? _result;

  static const List<String> availableGenres = [
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'History',
    'Horror',
    'Music',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Thriller',
    'War',
    'Western',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _budgetController.dispose();
    _runtimeController.dispose();
    super.dispose();
  }

  Future<void> _runPrediction() async {
    if (!_formKey.currentState!.validate()) return;

    final budget = double.tryParse(_budgetController.text.trim()) ?? 0.0;
    final runtime = double.tryParse(_runtimeController.text.trim()) ?? 120.0;

    setState(() {
      _isPredicting = true;
      _errorMessage = null;
    });

    try {
      final req = PredictionRequest(
        title: _titleController.text.trim(),
        budget: budget,
        runtime: runtime,
        releaseYear: _releaseYear,
        releaseMonth: _releaseMonth,
        originalLanguage: _language,
        mainCountry: _country,
        genres: _selectedGenres.toList(),
      );

      final res = await _predictionService.predict(req);
      setState(() {
        _result = res;
        _isPredicting = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isPredicting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final padding = AppSpacing.horizontalScreenPadding(context);

    return Scaffold(
      appBar: const CineAppBar(title: 'Box Office AI'),
      body: _isPredicting
          ? const CineLoadingIndicator(message: 'Executing ElasticNet ML model pipeline...')
          : SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: padding, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Box Office Revenue Predictor',
                    style: TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Trained on 45,000+ commercial film releases to evaluate projected worldwide gross from budget and distribution variables.',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                  ),

                  const SizedBox(height: 24),

                  if (_errorMessage != null) ...[
                    CineErrorView(message: _errorMessage!, onRetry: _runPrediction),
                    const SizedBox(height: 16),
                  ],

                  if (_result != null) ...[
                    _buildResultCard(),
                    const SizedBox(height: 24),
                  ],

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          controller: _titleController,
                          decoration: const InputDecoration(labelText: 'Movie Title'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 14),

                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _budgetController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: 'Budget (USD \$)',
                                  prefixText: '\$ ',
                                ),
                                validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _runtimeController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: 'Runtime (Minutes)',
                                  suffixText: 'min',
                                ),
                                validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<int>(
                                initialValue: _releaseYear,
                                decoration: const InputDecoration(labelText: 'Release Year'),
                                dropdownColor: AppColors.surfaceElevated,
                                items: [2024, 2025, 2026, 2027, 2028].map((y) {
                                  return DropdownMenuItem(value: y, child: Text(y.toString()));
                                }).toList(),
                                onChanged: (v) => setState(() => _releaseYear = v!),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DropdownButtonFormField<int>(
                                initialValue: _releaseMonth,
                                decoration: const InputDecoration(labelText: 'Release Month'),
                                dropdownColor: AppColors.surfaceElevated,
                                items: List.generate(12, (i) => i + 1).map((m) {
                                  return DropdownMenuItem(value: m, child: Text('Month $m'));
                                }).toList(),
                                onChanged: (v) => setState(() => _releaseMonth = v!),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        const Text(
                          'Genres',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accent),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: availableGenres.map((g) {
                            final isSelected = _selectedGenres.contains(g);
                            return FilterChip(
                              label: Text(g),
                              selected: isSelected,
                              onSelected: (val) {
                                setState(() {
                                  if (val) {
                                    _selectedGenres.add(g);
                                  } else {
                                    _selectedGenres.remove(g);
                                  }
                                });
                              },
                              selectedColor: AppColors.accent.withValues(alpha: 0.2),
                              backgroundColor: AppColors.surface2,
                              side: BorderSide(color: isSelected ? AppColors.accent : AppColors.border),
                              labelStyle: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                color: isSelected ? AppColors.accent : AppColors.textMuted,
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 28),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _runPrediction,
                            icon: const Icon(Icons.analytics_rounded, size: 18),
                            label: const Text('Calculate Projected Revenue'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildResultCard() {
    final r = _result!;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.accent, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ML Prediction Output',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.accent),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  r.category,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.accent),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '\$${r.predictedRevenueMillions.toStringAsFixed(1)} Million',
            style: const TextStyle(
              fontFamily: 'Georgia',
              fontSize: 32,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Estimated Worldwide Gross (${r.title})',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
          if (r.roiPercentage != null) ...[
            const SizedBox(height: 12),
            Text(
              'Projected ROI: ${r.roiPercentage! >= 0 ? '+' : ''}${r.roiPercentage!.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: r.roiPercentage! >= 0 ? AppColors.greenAccent : AppColors.error,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Text(
            r.summary,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }
}
