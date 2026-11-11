// Design system "NACHTSCHICHT" – same tokens as app/style.css and DESIGN.md.
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class C {
  static const bg = Color(0xFF111113);
  static const surface = Color(0xFF19191C);
  static const surface2 = Color(0xFF222226);
  static const line = Color(0xFF2C2C31);
  static const line2 = Color(0xFF424248);
  static const text = Color(0xFFEFECE6);
  static const muted = Color(0xFF8B8881);
  static const dim = Color(0xFF5C5A55);
  static const accent = Color(0xFFFF2B1C);
  static const ink = Color(0xFF0B0B0C);
  static const green = Color(0xFF3DDC84);
  static const amber = Color(0xFFFFB020);
}

/// Wide, heavy headline face (always uppercase in use).
TextStyle display(double size, {Color color = C.text}) => GoogleFonts.unbounded(
    fontSize: size, fontWeight: FontWeight.w800, color: color, height: 1.0, letterSpacing: -0.4);

/// Monospace for all data: dates, times, labels, buttons.
TextStyle mono(double size,
        {Color color = C.muted, FontWeight weight = FontWeight.w600, double spacing = 1.1}) =>
    GoogleFonts.jetBrainsMono(fontSize: size, fontWeight: weight, color: color, letterSpacing: spacing);

/// Calm grotesk for body text.
TextStyle body(double size, {Color color = C.text, FontWeight weight = FontWeight.w400}) =>
    GoogleFonts.interTight(fontSize: size, color: color, fontWeight: weight, height: 1.35);

ThemeData buildTheme() {
  final base = ThemeData(brightness: Brightness.dark, useMaterial3: true);
  const square = OutlineInputBorder(
      borderRadius: BorderRadius.zero, borderSide: BorderSide(color: C.line2));
  return base.copyWith(
    scaffoldBackgroundColor: C.bg,
    canvasColor: C.bg,
    colorScheme: const ColorScheme.dark(
        primary: C.accent, onPrimary: C.ink, secondary: C.text, surface: C.surface, onSurface: C.text),
    textTheme: GoogleFonts.interTightTextTheme(base.textTheme)
        .apply(bodyColor: C.text, displayColor: C.text),
    appBarTheme: AppBarTheme(
        backgroundColor: C.bg,
        foregroundColor: C.text,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: mono(12, color: C.text)),
    dividerColor: C.line,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: C.surface,
      border: square,
      enabledBorder: square,
      focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.zero, borderSide: BorderSide(color: C.text)),
      labelStyle: mono(11),
      hintStyle: body(15, color: C.dim),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
    ),
    snackBarTheme: SnackBarThemeData(
        backgroundColor: C.text,
        contentTextStyle: mono(12, color: C.bg),
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder()),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: C.accent),
  );
}
