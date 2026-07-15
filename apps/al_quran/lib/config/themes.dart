import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/constants.dart';

class AppTheme {
  AppTheme._();

  // ---- Color Palette ----
  // Light Theme Colors
  static const Color _lightPrimary = Color(0xFF1B5E20);
  static const Color _lightPrimaryVariant = Color(0xFF2E7D32);
  static const Color _lightAccentGold = Color(0xFFD4A574);
  static const Color _lightBackground = Color(0xFFFAFAF5);
  static const Color _lightSurface = Color(0xFFFFFFFF);
  static const Color _lightTextPrimary = Color(0xFF1A1A1A);
  static const Color _lightTextSecondary = Color(0xFF5C5C5C);
  static const Color _lightArabicText = Color(0xFF2C2C2C);
  static const Color _lightDivider = Color(0xFFE8E8E0);

  // Dark Theme Colors
  static const Color _darkPrimary = Color(0xFF4CAF50);
  static const Color _darkPrimaryVariant = Color(0xFF66BB6A);
  static const Color _darkAccentGold = Color(0xFFE8B88A);
  static const Color _darkBackground = Color(0xFF0F1A0F);
  static const Color _darkSurface = Color(0xFF1A2A1A);
  static const Color _darkTextPrimary = Color(0xFFF5F5F0);
  static const Color _darkTextSecondary = Color(0xFFA8A8A0);
  static const Color _darkArabicText = Color(0xFFFFFFFF);
  static const Color _darkDivider = Color(0xFF2A3A2A);

  // Shared
  static const Color _error = Color(0xFFD32F2F);
  // ignore: unused_field
  static const Color _success = Color(0xFF388E3C);
  // ignore: unused_field
  static const Color _warning = Color(0xFFF57C00);

  // ---- Theme Data ----

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.light(
      primary: _lightPrimary,
      primaryContainer: _lightPrimaryVariant,
      secondary: _lightAccentGold,
      surface: _lightSurface,
      error: _error,
      onPrimary: Colors.white,
      onSecondary: const Color(0xFF1A1A1A),
      onSurface: _lightTextPrimary,
      onError: Colors.white,
      outline: _lightDivider,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      brightness: Brightness.light,
      scaffoldBackgroundColor: _lightBackground,
      dividerColor: _lightDivider,
      dividerTheme: const DividerThemeData(color: _lightDivider, thickness: 0.5),

      // Text Theme
      textTheme: GoogleFonts.interTextTheme().copyWith(
        // Arabic Ayah Text
        headlineLarge: GoogleFonts.amiri(
          fontSize: AppConstants.defaultArabicFontSize,
          color: _lightArabicText,
          height: 1.8,
        ),
        // Surah Name (Arabic)
        headlineMedium: GoogleFonts.amiri(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: _lightTextPrimary,
        ),
        // Surah Name (English)
        titleLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: _lightTextPrimary,
        ),
        // Translation Text
        bodyLarge: GoogleFonts.inter(
          fontSize: AppConstants.defaultTranslationFontSize,
          color: _lightTextSecondary,
          height: 1.5,
        ),
        // UI Headers
        titleMedium: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: _lightTextPrimary,
        ),
        // UI Body
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: _lightTextSecondary,
        ),
        // Ayah Number
        labelLarge: GoogleFonts.amiri(
          fontSize: 14,
          color: _lightTextSecondary,
        ),
        // Caption/Helper
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          color: _lightTextSecondary,
        ),
      ),

      // AppBar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: _lightSurface,
        foregroundColor: _lightTextPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: _lightTextPrimary,
        ),
      ),

      // Bottom Navigation Bar
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: _lightSurface,
        selectedItemColor: _lightPrimary,
        unselectedItemColor: _lightTextSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: _lightSurface,
        elevation: 1,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),

      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _lightPrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: _lightAccentGold,
        foregroundColor: Color(0xFF1A1A1A),
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: _lightBackground,
        selectedColor: _lightPrimary.withValues(alpha: 0.15),
        labelStyle: GoogleFonts.inter(fontSize: 13, color: _lightTextSecondary),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: _lightDivider),
        ),
      ),

      // Slider Theme
      sliderTheme: SliderThemeData(
        activeTrackColor: _lightPrimary,
        inactiveTrackColor: _lightPrimary.withValues(alpha: 0.2),
        thumbColor: _lightPrimary,
        overlayColor: _lightPrimary.withValues(alpha: 0.1),
      ),

      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: _lightSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.dark(
      primary: _darkPrimary,
      primaryContainer: _darkPrimaryVariant,
      secondary: _darkAccentGold,
      surface: _darkSurface,
      error: _error,
      onPrimary: const Color(0xFF0F1A0F),
      onSecondary: const Color(0xFF0F1A0F),
      onSurface: _darkTextPrimary,
      onError: Colors.white,
      outline: _darkDivider,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: _darkBackground,
      dividerColor: _darkDivider,
      dividerTheme: const DividerThemeData(color: _darkDivider, thickness: 0.5),

      // Text Theme
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineLarge: GoogleFonts.amiri(
          fontSize: AppConstants.defaultArabicFontSize,
          color: _darkArabicText,
          height: 1.8,
        ),
        headlineMedium: GoogleFonts.amiri(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: _darkTextPrimary,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: _darkTextPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: AppConstants.defaultTranslationFontSize,
          color: _darkTextSecondary,
          height: 1.5,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: _darkTextPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: _darkTextSecondary,
        ),
        labelLarge: GoogleFonts.amiri(
          fontSize: 14,
          color: _darkTextSecondary,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          color: _darkTextSecondary,
        ),
      ),

      // AppBar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: _darkSurface,
        foregroundColor: _darkTextPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: _darkTextPrimary,
        ),
      ),

      // Bottom Navigation Bar
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: _darkSurface,
        selectedItemColor: _darkPrimary,
        unselectedItemColor: _darkTextSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: _darkSurface,
        elevation: 1,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),

      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _darkPrimary,
          foregroundColor: const Color(0xFF0F1A0F),
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: _darkAccentGold,
        foregroundColor: Color(0xFF0F1A0F),
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: _darkSurface,
        selectedColor: _darkPrimary.withValues(alpha: 0.25),
        labelStyle: GoogleFonts.inter(fontSize: 13, color: _darkTextSecondary),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: _darkDivider),
        ),
      ),

      // Slider Theme
      sliderTheme: SliderThemeData(
        activeTrackColor: _darkPrimary,
        inactiveTrackColor: _darkPrimary.withValues(alpha: 0.2),
        thumbColor: _darkPrimary,
        overlayColor: _darkPrimary.withValues(alpha: 0.1),
      ),

      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: _darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
    );
  }
}
