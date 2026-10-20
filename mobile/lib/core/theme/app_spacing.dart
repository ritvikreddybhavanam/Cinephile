import 'package:flutter/material.dart';

/// Standardized Spacing Design Tokens for Cinephile.
class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;
  static const double huge = 40.0;

  // Touch target minimum size per accessibility standards
  static const double minTouchTarget = 48.0;

  // Responsive Breakpoints
  static const double breakpointCompact = 340.0;
  static const double breakpointStandard = 600.0;
  static const double breakpointTablet = 840.0;
  static const double breakpointDesktop = 1024.0;

  /// Returns responsive horizontal padding based on screen width
  static double horizontalScreenPadding(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < breakpointCompact) return 12.0;
    if (width < breakpointStandard) return 16.0;
    if (width < breakpointTablet) return 24.0;
    return 32.0;
  }

  /// Returns optimal grid column count for poster cards
  static int gridColumnCount(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < breakpointCompact) return 2;
    if (width < breakpointStandard) return 2;
    if (width < breakpointTablet) return 4;
    if (width < breakpointDesktop) return 5;
    return 6;
  }

  /// Max content width container constraint for tablet & web
  static const double maxContentWidth = 1200.0;
}
