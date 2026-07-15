import 'package:flutter/material.dart';
import 'package:home_widget/home_widget.dart';
import '../core/models/ayah.dart';
import '../core/utils/audio_utils.dart';

class DailyAyahWidgetProvider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // In a real app, fetch the current daily ayah
    final ayah = Ayah(
      number: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      numberInSurah: 1,
      juz: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false,
      english: 'In the name of Allah, the Most Gracious, the Most Merciful.',
    );

    return HomeWidget(
      size: const Size(400, 200),
      renderMode: WidgetRenderMode.gpu,
      child: Container(
        color: const Color(0xFF1B5E20),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Daily Ayah',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Directionality(
                textDirection: TextDirection.rtl,
                child: Text(
                  ayah.text,
                  style: GoogleFonts.amiri(
                    fontSize: 24,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              ayah.english ?? '',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Call this when the daily ayah updates
Future<void> updateDailyAyahWidget(Ayah ayah) async {
  await HomeWidget.saveWidget(DailyAyahWidgetProvider(ayah: ayah));
}
