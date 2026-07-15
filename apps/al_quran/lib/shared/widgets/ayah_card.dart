import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/utils/arabic_numbers.dart';

class AyahCard extends StatelessWidget {
  final int ayahNumber;
  final String arabicText;
  final String? translationText;
  final String? transliterationText;
  final String? banglaText;
  final String? banglaPronunciation;
  final double arabicFontSize;
  final double translationFontSize;
  final bool showTranslation;
  final bool showTransliteration;
  final bool showBanglaPronunciation;
  final bool isHighlighted;
  final VoidCallback? onBookmark;
  final VoidCallback? onTafsir;
  final bool isBookmarked;

  const AyahCard({
    super.key,
    required this.ayahNumber,
    required this.arabicText,
    this.translationText,
    this.transliterationText,
    this.banglaText,
    this.banglaPronunciation,
    this.arabicFontSize = 28,
    this.translationFontSize = 16,
    this.showTranslation = true,
    this.showTransliteration = false,
    this.showBanglaPronunciation = false,
    this.isHighlighted = false,
    this.onBookmark,
    this.onTafsir,
    this.isBookmarked = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: isHighlighted
            ? theme.colorScheme.primary.withValues(alpha: 0.08)
            : Colors.transparent,
        border: isHighlighted
            ? Border(
                left: BorderSide(
                  color: theme.colorScheme.primary,
                  width: 3,
                ),
              )
            : null,
        borderRadius: isHighlighted
            ? const BorderRadius.horizontal(left: Radius.circular(4))
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Arabic Text
          Directionality(
            textDirection: TextDirection.rtl,
            child: Text(
              arabicText,
              textAlign: TextAlign.right,
              style: GoogleFonts.amiri(
                fontSize: arabicFontSize,
                height: 1.8,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),

          const SizedBox(height: 4),

          // Ayah Number Ornament
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: theme.colorScheme.outline,
                    width: 1.5,
                  ),
                ),
                child: Center(
                  child: Text(
                    ArabicNumbers.toArabic(ayahNumber),
                    style: GoogleFonts.amiri(
                      fontSize: 12,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Transliteration (shown when toggled)
          if (showTransliteration &&
              transliterationText != null &&
              transliterationText!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                transliterationText!,
                style: TextStyle(
                  fontSize: translationFontSize - 2,
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  height: 1.5,
                ),
              ),
            ),

          // Bangla Pronunciation (shown when toggled)
          if (showBanglaPronunciation &&
              banglaPronunciation != null &&
              banglaPronunciation!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                banglaPronunciation!,
                style: TextStyle(
                  fontSize: translationFontSize - 1,
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
                  height: 1.5,
                ),
              ),
            ),

          // Translation Text (Bangla)
          if (showTranslation &&
              banglaText != null &&
              banglaText!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                banglaText!,
                textAlign: TextAlign.start,
                style: TextStyle(
                  fontSize: translationFontSize,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                  height: 1.5,
                ),
              ),
            ),

          // Translation Text (English)
          if (showTranslation &&
              translationText != null &&
              translationText!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                translationText!,
                textAlign: TextAlign.start,
                style: TextStyle(
                  fontSize: translationFontSize,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
                  height: 1.5,
                ),
              ),
            ),

          // Action buttons
          if (onBookmark != null || onTafsir != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (onBookmark != null)
                    _AnimatedBookmarkButton(
                      isBookmarked: isBookmarked,
                      onPressed: onBookmark!,
                      theme: theme,
                    ),
                  if (onTafsir != null)
                    IconButton(
                      icon: Icon(
                        Icons.info_outline,
                        size: 20,
                        color: theme.colorScheme.onSurface
                            .withValues(alpha: 0.5),
                      ),
                      onPressed: onTafsir,
                      constraints:
                          const BoxConstraints(minWidth: 36, minHeight: 36),
                      padding: EdgeInsets.zero,
                      tooltip: 'Tafsir',
                    ),
                ],
              ),
            ),

          // Divider
          Divider(
            color: theme.dividerColor,
            height: 1,
            thickness: 0.5,
          ),
        ],
      ),
    );
  }
}

class _AnimatedBookmarkButton extends StatefulWidget {
  final bool isBookmarked;
  final VoidCallback onPressed;
  final ThemeData theme;

  const _AnimatedBookmarkButton({
    required this.isBookmarked,
    required this.onPressed,
    required this.theme,
  });

  @override
  State<_AnimatedBookmarkButton> createState() =>
      _AnimatedBookmarkButtonState();
}

class _AnimatedBookmarkButtonState extends State<_AnimatedBookmarkButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticInOut),
    );
  }

  @override
  void didUpdateWidget(_AnimatedBookmarkButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isBookmarked != widget.isBookmarked) {
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        );
      },
      child: IconButton(
        icon: Icon(
          widget.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
          size: 20,
          color: widget.isBookmarked
              ? widget.theme.colorScheme.secondary
              : widget.theme.colorScheme.onSurface.withValues(alpha: 0.5),
        ),
        onPressed: widget.onPressed,
        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        padding: EdgeInsets.zero,
        tooltip: widget.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
      ),
    );
  }
}
