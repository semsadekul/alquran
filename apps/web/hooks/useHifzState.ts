import { useState, useEffect } from 'react';

export interface HifzState {
  memorizedSurahs: number[]; // Array of surah numbers
  dailyGoalVerses: number;
  currentGoalSurah: number;
}

const DEFAULT_STATE: HifzState = {
  memorizedSurahs: [],
  dailyGoalVerses: 10,
  currentGoalSurah: 36 // Surah Yasin as default goal
};

export function useHifzState() {
  const [state, setState] = useState<HifzState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('alquran_hifz_state');
      if (saved) {
        setState({ ...DEFAULT_STATE, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Error loading hifz state:', e);
    }
    setIsLoaded(true);
  }, []);

  const saveState = (newState: Partial<HifzState>) => {
    const updated = { ...state, ...newState };
    setState(updated);
    localStorage.setItem('alquran_hifz_state', JSON.stringify(updated));
  };

  const markSurahMemorized = (surahNumber: number) => {
    if (!state.memorizedSurahs.includes(surahNumber)) {
      saveState({ memorizedSurahs: [...state.memorizedSurahs, surahNumber] });
    }
  };

  const unmarkSurahMemorized = (surahNumber: number) => {
    saveState({
      memorizedSurahs: state.memorizedSurahs.filter(s => s !== surahNumber)
    });
  };

  const setDailyGoal = (verses: number, surahNumber?: number) => {
    saveState({
      dailyGoalVerses: verses,
      ...(surahNumber && { currentGoalSurah: surahNumber })
    });
  };

  return {
    state,
    isLoaded,
    markSurahMemorized,
    unmarkSurahMemorized,
    setDailyGoal
  };
}
