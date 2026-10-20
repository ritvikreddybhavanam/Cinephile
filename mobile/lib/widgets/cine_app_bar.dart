import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';

/// Top App Bar featuring the Cinephile serif brand wordmark, drawer trigger, and optional actions.
class CineAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? leading;
  final List<Widget>? actions;
  final String? title;
  final bool showBrandWordmark;
  final PreferredSizeWidget? bottom;

  const CineAppBar({
    super.key,
    this.leading,
    this.actions,
    this.title,
    this.showBrandWordmark = true,
    this.bottom,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: leading,
      title: showBrandWordmark
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Cinephile',
                  style: AppTypography.brandWordmark,
                ),
                if (title != null) ...[
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      '· $title',
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ],
            )
          : (title != null
              ? Text(
                  title!,
                  style: const TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                )
              : null),
      bottom: bottom != null
          ? PreferredSize(
              preferredSize: bottom!.preferredSize,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  bottom!,
                  Container(
                    color: AppColors.borderSubtle,
                    height: 1,
                  ),
                ],
              ),
            )
          : PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                color: AppColors.borderSubtle,
                height: 1,
              ),
            ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 1),
      );
}
