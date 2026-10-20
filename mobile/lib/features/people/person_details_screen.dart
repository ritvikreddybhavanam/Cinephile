import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/person.dart';
import '../../services/person_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying complete details for a Director, Actor, or Writer with filmography.
class PersonDetailsScreen extends StatefulWidget {
  final int personId;

  const PersonDetailsScreen({super.key, required this.personId});

  @override
  State<PersonDetailsScreen> createState() => _PersonDetailsScreenState();
}

class _PersonDetailsScreenState extends State<PersonDetailsScreen> {
  final PersonService _service = PersonService();
  Person? _person;
  bool _isLoading = true;
  String? _errorMessage;
  bool _isBioExpanded = false;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await _service.getPersonDetails(widget.personId);
      if (mounted) {
        setState(() {
          _person = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: CineAppBar(title: 'Creator Details'),
        body: CineLoadingIndicator(message: 'Loading filmography...'),
      );
    }

    if (_person == null) {
      return Scaffold(
        appBar: const CineAppBar(title: 'Not Found'),
        body: CineEmptyView(
          title: 'Person Not Found',
          subtitle: _errorMessage ?? 'Unable to retrieve biographical records.',
          icon: Icons.person_off_outlined,
        ),
      );
    }

    final person = _person!;

    return Scaffold(
      appBar: CineAppBar(title: person.name),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Photo and Quick Meta
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 110,
                    height: 155,
                    child: person.profileUrl != null
                        ? Image.network(
                            person.profileUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: AppColors.surfaceElevated,
                              child: const Icon(Icons.person, size: 48, color: AppColors.textMuted),
                            ),
                          )
                        : Container(
                            color: AppColors.surfaceElevated,
                            child: const Icon(Icons.person, size: 48, color: AppColors.textMuted),
                          ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        person.name,
                        style: const TextStyle(
                          fontFamily: 'Georgia',
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          person.knownForDepartment ?? '',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accent,
                          ),
                        ),
                      ),
                      if (person.placeOfBirth != null && person.placeOfBirth!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          person.placeOfBirth!,
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ],
                      if (person.birthday != null && person.birthday!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Born: ${person.birthday!}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Biography
            if (person.biography != null && person.biography!.isNotEmpty) ...[
              const Text(
                'Biography',
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                person.biography!,
                maxLines: _isBioExpanded ? null : 4,
                overflow: _isBioExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
              if (person.biography!.length > 200) ...[
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () => setState(() => _isBioExpanded = !_isBioExpanded),
                  child: Text(
                    _isBioExpanded ? 'Read Less' : 'Read Full Biography',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.accent,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 28),
            ],

            // Filmography / Known For
            if (person.knownForCredits.isNotEmpty) ...[
              Text(
                'Filmography (${person.knownForCredits.length})',
                style: const TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.58,
                  crossAxisSpacing: AppSpacing.sm,
                  mainAxisSpacing: AppSpacing.md,
                ),
                itemCount: person.knownForCredits.length,
                itemBuilder: (context, index) {
                  final film = person.knownForCredits[index];
                  return GestureDetector(
                    onTap: () {
                      Navigator.of(context).pushNamed(
                        RouteNames.movieDetails,
                        arguments: film.id,
                      );
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: film.posterUrl != null
                                ? Image.network(
                                    film.posterUrl!,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: AppColors.surfaceElevated,
                                      child: const Icon(Icons.movie, color: AppColors.textMuted),
                                    ),
                                  )
                                : Container(
                                    color: AppColors.surfaceElevated,
                                    child: const Icon(Icons.movie, color: AppColors.textMuted),
                                  ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  film.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  film.year,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
