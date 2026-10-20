import 'package:flutter/material.dart';

/// Cinephile Design System Color Tokens.
/// Combines the "Midnight Cinema" dark palette with classic film-buff green accents
/// and champagne gold highlights.
class AppColors {
  AppColors._();

  // Backgrounds & Canvas
  static const Color background = Color(0xFF0B0C10);
  static const Color backgroundAlt = Color(0xFF0B0D0F);
  static const Color surface = Color(0xFF14161C);
  static const Color surfaceAlt = Color(0xFF101418);
  static const Color surface2 = Color(0xFF1B1E26);
  static const Color surfaceElevated = Color(0xFF222631);

  // Borders & Dividers
  static const Color border = Color(0xFF262A34);
  static const Color borderSubtle = Color(0xFF1A1D24);
  static const Color borderAccent = Color(0x59C9A86A);
  static const Color borderGreen = Color(0x5900E054);

  // Text Hierarchy
  static const Color textPrimary = Color(0xFFECE8E1);
  static const Color textSecondary = Color(0xFFA6A29A);
  static const Color textMuted = Color(0xFF6E6B65);

  // Primary Accent: Champagne Gold
  static const Color accent = Color(0xFFC9A86A);
  static const Color accentHover = Color(0xFFDDBF85);
  static const Color accentSoft = Color(0x1FC9A86A);

  // Secondary Accent: Film-buff Neon / Emerald Green
  static const Color greenAccent = Color(0xFF00E054);
  static const Color greenAccentLight = Color(0xFF43FE6D);
  static const Color greenSoft = Color(0x1F00E054);

  // Semantic Colors
  static const Color wine = Color(0xFF7C3A4B);
  static const Color success = Color(0xFF7FA88C);
  static const Color error = Color(0xFFC4646F);
  static const Color favorite = Color(0xFFE05A6F);
  static const Color warning = Color(0xFFE5A93C);
  static const Color star = Color(0xFFFFB800);
  static const Color info = Color(0xFF4A90E2);

  // Overlays & Scrims
  static const Color scrim = Color(0xCC0B0C10);
  static const Color backdropGradientStart = Colors.transparent;
  static const Color backdropGradientEnd = Color(0xFF0B0C10);
}
