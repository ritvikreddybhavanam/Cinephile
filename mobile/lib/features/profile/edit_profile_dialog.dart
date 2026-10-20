import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/user_profile.dart';
import '../../services/user_service.dart';

/// Modal dialog to edit user's display profile, bio, location, and cinephile genres.
class EditProfileDialog extends StatefulWidget {
  final UserProfile? initialProfile;

  const EditProfileDialog({super.key, this.initialProfile});

  static Future<bool?> show(BuildContext context, {UserProfile? profile}) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EditProfileDialog(initialProfile: profile),
    );
  }

  @override
  State<EditProfileDialog> createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends State<EditProfileDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstController;
  late TextEditingController _lastController;
  late TextEditingController _bioController;
  late TextEditingController _locController;
  late TextEditingController _webController;

  final List<String> _availableGenres = [
    'Drama',
    'Sci-Fi',
    'Crime',
    'Thriller',
    'Horror',
    'Comedy',
    'Animation',
    'Mystery',
    'Action',
    'Romance',
    'Documentary',
  ];
  late List<String> _selectedGenres;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.initialProfile;
    _firstController = TextEditingController(text: p?.firstname ?? '');
    _lastController = TextEditingController(text: p?.lastname ?? '');
    _bioController = TextEditingController(text: p?.bio ?? '');
    _locController = TextEditingController(text: p?.location ?? '');
    _webController = TextEditingController(text: p?.website ?? '');
    _selectedGenres = List.from(p?.favoriteGenres ?? []);
  }

  @override
  void dispose() {
    _firstController.dispose();
    _lastController.dispose();
    _bioController.dispose();
    _locController.dispose();
    _webController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    try {
      await context.read<UserService>().updateProfile(
            firstname: _firstController.text.trim(),
            lastname: _lastController.text.trim(),
            bio: _bioController.text.trim(),
            location: _locController.text.trim(),
            website: _webController.text.trim(),
            favoriteGenres: _selectedGenres,
          );

      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppColors.accent,
        ),
      );
      navigator.pop(true);
    } catch (e) {
      setState(() => _isSaving = false);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        border: Border(top: BorderSide(color: AppColors.border, width: 1.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.edit_rounded, color: AppColors.accent, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'Edit Cinephile Profile',
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded,
                      color: AppColors.textMuted, size: 22),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Scrollable Form
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _firstController,
                            decoration: const InputDecoration(labelText: 'First Name'),
                            validator: (v) =>
                                (v == null || v.trim().isEmpty) ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _lastController,
                            decoration: const InputDecoration(labelText: 'Last Name'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _bioController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Bio & Film Philosophy',
                        hintText: 'Share your cinematic tastes, favorite directors...',
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _locController,
                      decoration: const InputDecoration(
                        labelText: 'Location',
                        hintText: 'e.g. Los Angeles, CA',
                        prefixIcon: Icon(Icons.place_outlined, size: 18),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _webController,
                      decoration: const InputDecoration(
                        labelText: 'Website / Portfolio',
                        hintText: 'https://...',
                        prefixIcon: Icon(Icons.link_rounded, size: 18),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Favorite Genres
                    const Text(
                      'Favorite Genres',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _availableGenres.map((g) {
                        final isSelected = _selectedGenres.contains(g);
                        return FilterChip(
                          label: Text(g),
                          selected: isSelected,
                          selectedColor: AppColors.accent.withValues(alpha: 0.2),
                          checkmarkColor: AppColors.accent,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            color: isSelected ? AppColors.accent : AppColors.textSecondary,
                          ),
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _selectedGenres.add(g);
                              } else {
                                _selectedGenres.remove(g);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 28),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        child: _isSaving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.background,
                                ),
                              )
                            : const Text('Save Changes',
                                style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
