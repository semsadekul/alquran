import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/models/surah.dart';
import '../../core/utils/arabic_numbers.dart';

class SurahTile extends StatelessWidget {
  final Surah surah;
  final VoidCallback? onTap;
  final VoidCallback? onPlay;

  const SurahTile({
    super.key,
    required this.surah,
    this.onTap,
    this.onPlay,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: Row(
            children: [
              // Surah Number Ornament
              _SurahNumberBadge(number: surah.number, theme: theme),

              const SizedBox(width: 12),

              // Surah Name Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // English Name
                    Text(
                      '${surah.number}. ${surah.englishName}',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    // English Translation + Ayah Count + Revelation Type
                    Row(
                      children: [
                        Text(
                          surah.englishNameTranslation,
                          style: TextStyle(
                            fontSize: 13,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.6),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: surah.revelationType == RevelationType.meccan
                                ? Colors.blue.withValues(alpha: 0.1)
                                : Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            surah.revelationType == RevelationType.meccan
                                ? 'Makki'
                                : 'Madani',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color:
                                  surah.revelationType == RevelationType.meccan
                                      ? Colors.blue
                                      : Colors.green,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${surah.numberOfAyahs} ayahs',
                          style: TextStyle(
                            fontSize: 12,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.5),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Arabic Name (vertical)
              Directionality(
                textDirection: TextDirection.rtl,
                child: Text(
                  surah.name,
                  style: GoogleFonts.amiri(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),

              // Play button
              if (onPlay != null)
                IconButton(
                  icon: Icon(
                    Icons.play_circle_outline,
                    color: theme.colorScheme.primary,
                  ),
                  onPressed: onPlay,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SurahNumberBadge extends StatelessWidget {
  final int number;
  final ThemeData theme;

  const _SurahNumberBadge({
    required this.number,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: theme.colorScheme.primary.withValues(alpha: 0.08),
      ),
      child: Center(
        child: Text(
          ArabicNumbers.toArabic(number),
          style: GoogleFonts.amiri(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
      ),
    );
  }
}
