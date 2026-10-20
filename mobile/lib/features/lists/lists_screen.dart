import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie_list.dart';
import '../../services/list_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen managing Curated and Personal Movie Lists with creation modal and public browsing.
class ListsScreen extends StatefulWidget {
  const ListsScreen({super.key});

  @override
  State<ListsScreen> createState() => _ListsScreenState();
}

class _ListsScreenState extends State<ListsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _loadData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ListService>().fetchMyLists();
      context.read<ListService>().fetchPublicLists();
    });
  }

  Future<void> _openCreateListDialog() async {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    bool isPrivate = false;

    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.surfaceElevated,
          title: const Text('Create New List'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'List Title',
                    hintText: 'e.g. 70s Neo-Noir Masterpieces',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Themes, personal reflections, or criteria...',
                  ),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Private List', style: TextStyle(fontSize: 13)),
                  subtitle: const Text(
                    'Only you can view this list',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                  value: isPrivate,
                  activeThumbColor: AppColors.accent,
                  onChanged: (val) => setDialogState(() => isPrivate = val),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.trim().isEmpty) return;
                try {
                  await context.read<ListService>().createList(
                        name: nameCtrl.text.trim(),
                        description: descCtrl.text.trim(),
                        isPrivate: isPrivate,
                      );
                  if (ctx.mounted) Navigator.of(ctx).pop(true);
                } catch (e) {
                  if (ctx.mounted) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
              },
              child: const Text('Create List'),
            ),
          ],
        ),
      ),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Created list successfully!'),
          backgroundColor: AppColors.accent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final listService = context.watch<ListService>();
    final myLists = listService.myLists;
    final publicLists = listService.publicLists;

    return Scaffold(
      appBar: CineAppBar(
        title: 'Curated Lists',
        actions: [
          IconButton(
            icon: const Icon(Icons.playlist_add_rounded, color: AppColors.accent),
            tooltip: 'New List',
            onPressed: _openCreateListDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.accent,
          labelColor: AppColors.accent,
          unselectedLabelColor: AppColors.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: 'My Lists'),
            Tab(text: 'Public Curations'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateListDialog,
        backgroundColor: AppColors.accent,
        foregroundColor: AppColors.background,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New List', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. My Lists
          _buildListsTab(
            lists: myLists,
            isLoading: listService.isLoading && myLists.isEmpty,
            onRefresh: () => context.read<ListService>().fetchMyLists(),
            emptyTitle: 'No Lists Created Yet',
            emptySubtitle:
                'Curate themed movie collections, rankings, or watch queues to share with friends.',
            isMyLists: true,
          ),

          // 2. Public Curations
          _buildListsTab(
            lists: publicLists,
            isLoading: listService.isLoading && publicLists.isEmpty,
            onRefresh: () => context.read<ListService>().fetchPublicLists(),
            emptyTitle: 'No Public Lists Available',
            emptySubtitle: 'Explore community-curated film collections.',
            isMyLists: false,
          ),
        ],
      ),
    );
  }

  Widget _buildListsTab({
    required List<MovieList> lists,
    required bool isLoading,
    required Future<void> Function() onRefresh,
    required String emptyTitle,
    required String emptySubtitle,
    required bool isMyLists,
  }) {
    if (isLoading) {
      return const CineLoadingIndicator(message: 'Loading lists...');
    }

    if (lists.isEmpty) {
      return CineEmptyView(
        title: emptyTitle,
        subtitle: emptySubtitle,
        icon: Icons.featured_play_list_outlined,
        action: isMyLists
            ? ElevatedButton.icon(
                onPressed: _openCreateListDialog,
                icon: const Icon(Icons.add_rounded),
                label: const Text('Create Your First List'),
              )
            : null,
      );
    }

    return RefreshIndicator(
      color: AppColors.accent,
      backgroundColor: AppColors.surfaceElevated,
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.only(
          left: AppSpacing.md,
          right: AppSpacing.md,
          top: AppSpacing.md,
          bottom: 80,
        ),
        itemCount: lists.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = lists[index];
          return _buildListCard(item, isMyLists);
        },
      ),
    );
  }

  Widget _buildListCard(MovieList list, bool isMyList) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            RouteNames.listDetails,
            arguments: list,
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      list.name,
                      style: const TextStyle(
                        fontFamily: 'Georgia',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${list.movieCount} Films',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accent,
                      ),
                    ),
                  ),
                ],
              ),
              if (list.description.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  list.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
              const SizedBox(height: 10),
              Row(
                children: [
                  if (list.authorName != null) ...[
                    const Icon(Icons.person_outline, size: 13, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      list.authorName!,
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                    const SizedBox(width: 8),
                  ],
                  if (list.isPrivate)
                    const Row(
                      children: [
                        Icon(Icons.lock_outline, size: 12, color: AppColors.textMuted),
                        SizedBox(width: 3),
                        Text('Private', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  const Spacer(),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
