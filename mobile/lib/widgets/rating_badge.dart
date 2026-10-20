import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

/// Rating pill badge showing a gold star and decimal rating (e.g. ★ 8.4).
class RatingBadge extends StatelessWidget {
  final double rating;
  final bool compact;

  const RatingBadge({
    super.key,
    required this.rating,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final text = rating > 0.0 ? rating.toStringAsFixed(1) : 'NR';

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 6 : 8,
        vertical: compact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.border, width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(
            Icons.star_rounded,
            size: 14,
            color: AppColors.accent,
          ),
          const SizedBox(width: 3),
          Text(
            text,
            style: TextStyle(
              fontSize: compact ? 11 : 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}
