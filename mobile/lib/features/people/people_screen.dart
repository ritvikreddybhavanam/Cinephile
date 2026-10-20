import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/person.dart';
import '../../services/person_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying popular and searched actors, directors, and cinematic creators.
class PeopleScreen extends StatefulWidget {
  const PeopleScreen({super.key});

  @override
  State<PeopleScreen> createState() => _PeopleScreenState();
}

class _PeopleScreenState extends State<PeopleScreen> {
  final PersonService _service = PersonService();
  final TextEditingController _searchController = TextEditingController();

  List<Person> _people = [];
  bool _isLoading = true;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _loadPopularPeople();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadPopularPeople() async {
    setState(() => _isLoading = true);
    try {
      final list = await _service.getPopularPeople();
      if (mounted) setState(() => _people = list);
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _searchPeople(String query) async {
    _query = query.trim();
    if (_query.isEmpty) {
      _loadPopularPeople();
      return;
    }

    setState(() => _isLoading = true);
    try {
      final results = await _service.searchPeople(_query);
      if (mounted) setState(() => _people = results);
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CineAppBar(title: 'Directors & Actors'),
      body: Column(
        children: [
          // Search input
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search actors, directors, writers...',
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _searchPeople('');
                        },
                      )
                    : null,
              ),
              onSubmitted: _searchPeople,
            ),
          ),

          // Grid of people
          Expanded(
            child: _isLoading
                ? const CineLoadingIndicator(message: 'Loading cinematic talent...')
                : _people.isEmpty
                    ? CineEmptyView(
                        title: 'No People Found',
                        subtitle:
                            'No directors or cast members matched "$_query".',
                        icon: Icons.person_search_outlined,
                      )
                    : RefreshIndicator(
                        color: AppColors.accent,
                        backgroundColor: AppColors.surfaceElevated,
                        onRefresh: () =>
                            _query.isEmpty ? _loadPopularPeople() : _searchPeople(_query),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final crossAxisCount = constraints.maxWidth > 900
                                ? 6
                                : constraints.maxWidth > 600
                                    ? 4
                                    : 3;

                            return GridView.builder(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              physics: const AlwaysScrollableScrollPhysics(),
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                childAspectRatio: 0.72,
                                crossAxisSpacing: AppSpacing.sm,
                                mainAxisSpacing: AppSpacing.md,
                              ),
                              itemCount: _people.length,
                              itemBuilder: (context, index) {
                                final person = _people[index];
                                return _buildPersonCard(person);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonCard(Person person) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pushNamed(
          RouteNames.personDetails,
          arguments: person.id,
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
          children: [
            Expanded(
              child: SizedBox(
                width: double.infinity,
                child: person.profileUrl != null
                    ? Image.network(
                        person.profileUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: AppColors.surfaceElevated,
                          child: const Icon(Icons.person, color: AppColors.textMuted, size: 36),
                        ),
                      )
                    : Container(
                        color: AppColors.surfaceElevated,
                        child: const Icon(Icons.person, color: AppColors.textMuted, size: 36),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: Column(
                children: [
                  Text(
                    person.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    person.knownForDepartment ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
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
  }
}
