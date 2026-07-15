const DB_NAME = 'AlQuranOfflineDB';
const DB_VERSION = 1;
let db = null;

const FEATURED_AYAH_POOL = [
  { surah: 2, ayah: 2 },
  { surah: 36, ayah: 58 },
  { surah: 55, ayah: 13 },
  { surah: 94, ayah: 5 },
  { surah: 39, ayah: 53 },
  { surah: 13, ayah: 28 }
];

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error('Database failed to open:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = event => {
      db = event.target.result;
      console.log('Database initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = event => {
      const upgradeDb = event.target.result;

      if (!upgradeDb.objectStoreNames.contains('surahs')) {
        upgradeDb.createObjectStore('surahs', { keyPath: 'number' });
      }

      if (!upgradeDb.objectStoreNames.contains('verses')) {
        const versesStore = upgradeDb.createObjectStore('verses', { keyPath: 'number' });
        versesStore.createIndex('surah', 'surah', { unique: false });
      }

      if (!upgradeDb.objectStoreNames.contains('bookmarks')) {
        upgradeDb.createObjectStore('bookmarks', { keyPath: 'surah_ayah' });
      }

      if (!upgradeDb.objectStoreNames.contains('settings')) {
        upgradeDb.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

function writeData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = e => reject(e.target.error);
  });
}

function getFromStore(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

function getAllFromStore(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

function getVersesBySurah(surahNumber) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['verses'], 'readonly');
    const store = transaction.objectStore('verses');
    const index = store.index('surah');
    const request = index.getAll(surahNumber);

    request.onsuccess = e => {
      const sorted = e.target.result.sort((a, b) => a.ayah - b.ayah);
      resolve(sorted);
    };
    request.onerror = e => reject(e.target.error);
  });
}

function deleteFromStore(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(key);

    transaction.oncomplete = () => resolve();
    transaction.onerror = e => reject(e.target.error);
  });
}

let searchDebounce = null;
let toastTimeouts = new Map();
let voiceRecognition = null;

let state = {
  surahs: [],
  currentSurah: null,
  currentVerses: [],
  bookmarks: [],
  lastRead: null,
  allVersesForSearch: [],
  recentSurahs: [],
  recentSearches: [],
  overlaySearchMode: 'all',
  isSearchOverlayOpen: false,
  isVoiceSearchAvailable: false,
  isVoiceListening: false,
  dailyAyah: null,
  reader: {
    focusMode: false,
    progress: 0
  },
  settings: {
    theme: 'dark',
    arabicFont: 'amiri',
    fontSizeMultiplier: 1.0,
    showArabic: true,
    showTransliteration: true,
    showBangla: true,
    showBanglaTransliteration: true,
    showEnglish: true,
    sidebarCollapsed: false
  }
};

let audioPlayer = {
  audio: new Audio(),
  isPlaying: false,
  playlist: [],
  currentIndex: -1,
  activeVerseCard: null,
  previousVolume: 0.8,

  init() {
    this.audio.volume = 0.8;
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
    this.audio.addEventListener('error', e => {
      if (!this.audio.getAttribute('src')) return;
      console.error('Audio load error:', e);
      showToast('Audio unavailable', 'Recitation streaming requires an internet connection.', 'warning');
      this.stop();
    });
  },

  formatNum(num) {
    return String(num).padStart(3, '0');
  },

  getAudioUrl(surah, ayah) {
    return `https://everyayah.com/data/Alafasy_128kbps/${this.formatNum(surah)}${this.formatNum(ayah)}.mp3`;
  },

  playVerse(surah, ayah, versesList) {
    this.playlist = versesList || state.currentVerses;
    this.currentIndex = this.playlist.findIndex(v => v.surah === surah && v.ayah === ayah);

    if (this.currentIndex !== -1) {
      this.playActive();
    }
  },

  playSurah(versesList, startAyah = null) {
    if (!Array.isArray(versesList) || versesList.length === 0) {
      showToast('No Surah loaded', 'Select a Surah first, then start listening.', 'info');
      return;
    }

    this.playlist = versesList;
    this.currentIndex = startAyah
      ? this.playlist.findIndex(v => v.ayah === startAyah)
      : 0;

    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }

    this.playActive();
  },

  playCurrentSurahFromStart() {
    if (state.currentVerses && state.currentVerses.length > 0) {
      this.playSurah(state.currentVerses, 1);
      return;
    }

    if (state.currentSurah) {
      loadSurahReader(state.currentSurah.number).then(() => {
        this.playSurah(state.currentVerses, 1);
      });
      return;
    }

    if (state.lastRead) {
      loadSurahReader(state.lastRead.surah).then(() => {
        this.playSurah(state.currentVerses, 1);
      });
      return;
    }

    loadSurahReader(1).then(() => {
      this.playSurah(state.currentVerses, 1);
    });
  },

  playActive() {
    const verse = this.playlist[this.currentIndex];
    if (!verse) return;

    this.highlightVerseCard(verse.surah, verse.ayah);
    this.audio.src = this.getAudioUrl(verse.surah, verse.ayah);
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayerBarUI(verse);
    }).catch(err => {
      console.error('Audio failed to play:', err);
      showToast('Streaming failed', 'Could not stream audio recitation. Verify your internet connection.', 'warning');
      this.stop();
    });
  },

  playNext() {
    if (this.currentIndex + 1 < this.playlist.length) {
      this.currentIndex++;
      this.playActive();
    } else {
      showToast('Surah completed', 'Finished listening to the selected Surah.', 'info');
      this.stop();
    }
  },

  playPrev() {
    if (this.currentIndex - 1 >= 0) {
      this.currentIndex--;
      this.playActive();
    }
  },

  togglePlayPause() {
    if (!this.audio.src) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      document.getElementById('audio-play-icon').className = 'fa fa-play';
    } else {
      this.audio.play();
      this.isPlaying = true;
      document.getElementById('audio-play-icon').className = 'fa fa-pause';
    }
  },

  toggleMute() {
    const buttonIcon = document.querySelector('#audio-volume-btn i');
    if (!buttonIcon) return;

    if (this.audio.volume === 0) {
      const restored = this.previousVolume || 0.8;
      this.audio.volume = restored;
      document.getElementById('audio-volume-slider').value = restored;
      buttonIcon.className = 'fa fa-volume-high';
      return;
    }

    this.previousVolume = this.audio.volume;
    this.audio.volume = 0;
    document.getElementById('audio-volume-slider').value = 0;
    buttonIcon.className = 'fa fa-volume-xmark';
  },

  stop() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.isPlaying = false;
    this.currentIndex = -1;
    this.playlist = [];
    this.removeHighlights();
    document.getElementById('audio-player-bar').classList.remove('active');
  },

  highlightVerseCard(surah, ayah) {
    this.removeHighlights();
    const card = document.getElementById(`verse-card-${surah}-${ayah}`);
    if (card) {
      card.classList.add('verse-playing');
      card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      this.activeVerseCard = card;
    }
  },

  removeHighlights() {
    if (this.activeVerseCard) {
      this.activeVerseCard.classList.remove('verse-playing');
      this.activeVerseCard = null;
    }
  },

  updatePlayerBarUI(verse) {
    const playerBar = document.getElementById('audio-player-bar');
    playerBar.classList.add('active');

    const surah = state.surahs.find(s => s.number === verse.surah);
    document.getElementById('audio-surah-title').innerText = surah ? surah.englishName : `Surah ${verse.surah}`;
    document.getElementById('audio-verse-number').innerText = `Surah Listening • Verse ${verse.ayah}`;
    document.getElementById('audio-play-icon').className = 'fa fa-pause';

    document.getElementById('audio-prev-btn').disabled = this.currentIndex === 0;
    document.getElementById('audio-next-btn').disabled = this.currentIndex === this.playlist.length - 1;
  },

  updateProgressBar() {
    const progressFill = document.getElementById('audio-progress-fill-bar');
    const timeCur = document.getElementById('audio-time-current');
    const timeEnd = document.getElementById('audio-time-end');

    if (this.audio.duration) {
      const percentage = (this.audio.currentTime / this.audio.duration) * 100;
      progressFill.style.width = `${percentage}%`;
      timeCur.innerText = this.formatTime(this.audio.currentTime);
      timeEnd.innerText = this.formatTime(this.audio.duration);
    }
  },

  formatTime(secs) {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  },

  seek(event) {
    if (!this.audio.duration) return;
    const progressContainer = document.getElementById('audio-progress-container-bar');
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const seekPercentage = clickX / rect.width;
    this.audio.currentTime = seekPercentage * this.audio.duration;
  },

  setVolume(val) {
    this.audio.volume = Number(val);
    const buttonIcon = document.querySelector('#audio-volume-btn i');
    if (buttonIcon) {
      buttonIcon.className = Number(val) === 0 ? 'fa fa-volume-xmark' : 'fa fa-volume-high';
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  audioPlayer.init();
  hifzPlayer.init();
  setupVoiceSearch();
  await initDB();

  const savedSettings = await getFromStore('settings', 'app_config');
  if (savedSettings) {
    state.settings = { ...state.settings, ...savedSettings.value };
  }

  document.body.setAttribute('data-theme', state.settings.theme);
  applySidebarState();

  const syncStatus = await getFromStore('settings', 'sync_completed');
  const hasBnTrans = await getFromStore('settings', 'has_bn_trans');
  const bnTransFixedV2 = await getFromStore('settings', 'bn_trans_fixed_v2');

  if (syncStatus && syncStatus.value === true && hasBnTrans && hasBnTrans.value === true && bnTransFixedV2 && bnTransFixedV2.value === true) {
    document.getElementById('sync-overlay').classList.add('hidden-section');
    await loadAppData();
  } else {
    document.getElementById('sync-overlay').classList.remove('hidden-section');
    document.getElementById('start-sync-btn').classList.remove('hidden-section');
    document.getElementById('sync-progress-box').classList.add('hidden-section');

    if (syncStatus && syncStatus.value === true) {
      document.getElementById('start-sync-btn').innerText = 'Update Database (Fix Bangla Pronunciation)';
    }
  }

  setupEventListeners();
});

function setupEventListeners() {
  document.querySelectorAll('.tab-btn, .top-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      document.getElementById('sidebar').classList.remove('active');
    });
  });

  document.getElementById('menu-toggle-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
  });

  document.getElementById('sidebar-collapse-btn').addEventListener('click', async () => {
    state.settings.sidebarCollapsed = !state.settings.sidebarCollapsed;
    applySidebarState();
    await saveSettings();
  });

  document.getElementById('surah-search').addEventListener('input', e => {
    filterSurahList(e.target.value);
  });

  document.getElementById('quran-search-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') executeDeepSearch();
  });
  document.getElementById('quran-search-btn').addEventListener('click', executeDeepSearch);

  document.getElementById('start-sync-btn').addEventListener('click', startDataSync);

  document.getElementById('audio-play-pause-btn').addEventListener('click', () => audioPlayer.togglePlayPause());
  document.getElementById('audio-stop-btn').addEventListener('click', () => audioPlayer.stop());
  document.getElementById('audio-next-btn').addEventListener('click', () => audioPlayer.playNext());
  document.getElementById('audio-prev-btn').addEventListener('click', () => audioPlayer.playPrev());
  document.getElementById('audio-progress-container-bar').addEventListener('click', e => audioPlayer.seek(e));
  document.getElementById('audio-volume-slider').addEventListener('input', e => audioPlayer.setVolume(e.target.value));
  document.getElementById('audio-volume-btn').addEventListener('click', () => audioPlayer.toggleMute());

  document.getElementById('hifz-surah-select').addEventListener('change', e => {
    updateHifzAyahRange(parseInt(e.target.value, 10));
  });

  document.getElementById('hifz-start-btn').addEventListener('click', () => {
    const surahNum = parseInt(document.getElementById('hifz-surah-select').value, 10);
    const startAyah = parseInt(document.getElementById('hifz-start-ayah').value, 10);
    const endAyah = parseInt(document.getElementById('hifz-end-ayah').value, 10);
    const repeats = document.getElementById('hifz-verse-repeats').value;
    const loops = document.getElementById('hifz-loop-repeats').value;
    const delay = document.getElementById('hifz-delay-select').value;

    audioPlayer.stop();
    hifzPlayer.start(surahNum, startAyah, endAyah, repeats, loops, delay);
  });

  document.getElementById('hifz-pause-resume-btn').addEventListener('click', () => hifzPlayer.togglePauseResume());
  document.getElementById('hifz-stop-btn').addEventListener('click', () => hifzPlayer.stop());

  const updateHifzDisplay = () => {
    if (hifzPlayer.playlist.length > 0) {
      renderHifzVersesList();
    }
  };

  document.getElementById('hifz-toggle-arabic').addEventListener('change', updateHifzDisplay);
  document.getElementById('hifz-toggle-trans').addEventListener('change', updateHifzDisplay);
  document.getElementById('hifz-toggle-bn-trans').addEventListener('change', updateHifzDisplay);
  document.getElementById('hifz-toggle-bangla').addEventListener('change', updateHifzDisplay);

  document.getElementById('global-search-btn').addEventListener('click', openSearchOverlay);
  document.getElementById('sidebar-search-launch').addEventListener('click', openSearchOverlay);
  document.getElementById('quick-search-action').addEventListener('click', openSearchOverlay);
  document.getElementById('deep-search-action').addEventListener('click', openSearchOverlay);
  document.getElementById('top-settings-shortcut').addEventListener('click', () => switchTab('settings'));
  document.getElementById('top-audio-shortcut').addEventListener('click', async () => {
    if (!state.currentVerses.length) {
      if (state.currentSurah) {
        await loadSurahReader(state.currentSurah.number);
      } else if (state.lastRead) {
        await loadSurahReader(state.lastRead.surah);
      } else {
        await loadSurahReader(1);
      }
    }

    switchTab('reader');
    audioPlayer.playCurrentSurahFromStart();
    showToast('Surah listening started', 'Now playing the selected Surah continuously from the beginning.', 'info');
  });
  document.getElementById('search-overlay-close').addEventListener('click', closeSearchOverlay);
  document.getElementById('search-overlay-backdrop').addEventListener('click', closeSearchOverlay);

  document.getElementById('overlay-search-input').addEventListener('input', e => {
    const value = e.target.value;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      performOverlaySearch(value);
    }, 120);
  });

  document.getElementById('overlay-search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      saveRecentSearch(e.target.value.trim());
    }
  });

  document.querySelectorAll('.language-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.language-chip').forEach(chip => chip.classList.remove('active'));
      btn.classList.add('active');
      state.overlaySearchMode = btn.dataset.mode;
      performOverlaySearch(document.getElementById('overlay-search-input').value);
    });
  });

  document.querySelectorAll('.suggestion-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('overlay-search-input');
      input.value = btn.innerText.trim();
      performOverlaySearch(input.value);
      input.focus();
    });
  });

  document.getElementById('voice-search-btn').addEventListener('click', () => {
    if (!state.isVoiceSearchAvailable) {
      showToast('Voice search unavailable', 'This browser does not support voice recognition for search.', 'warning');
      return;
    }
    toggleVoiceSearch();
  });

  document.getElementById('start-reading-btn').addEventListener('click', () => {
    if (state.lastRead) {
      loadSurahReader(state.lastRead.surah, state.lastRead.ayah);
      return;
    }
    loadSurahReader(1);
  });

  document.getElementById('hero-continue-btn').addEventListener('click', () => {
    if (state.lastRead) {
      loadSurahReader(state.lastRead.surah, state.lastRead.ayah);
    } else {
      showToast('No last read yet', 'Start reading a Surah and mark an ayah to continue from there later.', 'info');
    }
  });

  document.getElementById('continue-reading-action').addEventListener('click', () => {
    if (state.lastRead) {
      loadSurahReader(state.lastRead.surah, state.lastRead.ayah);
    } else {
      loadSurahReader(1);
    }
  });

  document.getElementById('quick-bookmarks-action').addEventListener('click', () => switchTab('bookmarks'));
  document.getElementById('quick-hifz-action').addEventListener('click', () => switchTab('hifz'));

  document.getElementById('reader-font-scale-inline').addEventListener('input', async e => {
    state.settings.fontSizeMultiplier = parseFloat(e.target.value);
    const settingsSlider = document.getElementById('settings-font-scale');
    const settingsValue = document.getElementById('settings-font-scale-val');
    if (settingsSlider) settingsSlider.value = e.target.value;
    if (settingsValue) settingsValue.innerText = `${Math.round(state.settings.fontSizeMultiplier * 100)}%`;
    applyReaderFontStyles();
    await saveSettings();
  });

  document.getElementById('reader-focus-toggle').addEventListener('click', () => {
    state.reader.focusMode = !state.reader.focusMode;
    document.body.classList.toggle('reader-focus', state.reader.focusMode);
    showToast(
      state.reader.focusMode ? 'Focus mode enabled' : 'Focus mode disabled',
      state.reader.focusMode ? 'Navigation fades back so the reading surface takes priority.' : 'The full dashboard chrome is visible again.',
      'info'
    );
  });

  document.getElementById('reader-theme-toggle').addEventListener('click', async () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.settings.theme);
    const settingsTheme = document.getElementById('settings-theme');
    if (settingsTheme) settingsTheme.value = state.settings.theme;
    await saveSettings();
  });

  document.getElementById('reader-view').addEventListener('scroll', updateReaderProgressFromScroll);

  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : '';
    const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchOverlay();
      return;
    }

    if (!isTyping && e.key === '/') {
      e.preventDefault();
      openSearchOverlay();
      return;
    }

    if (e.key === 'Escape' && state.isSearchOverlayOpen) {
      closeSearchOverlay();
    }
  });
}

async function loadAppData() {
  state.surahs = await getAllFromStore('surahs');
  state.bookmarks = await getAllFromStore('bookmarks');

  const recentSurahsConfig = await getFromStore('settings', 'recent_surahs');
  state.recentSurahs = recentSurahsConfig?.value || [];

  const recentSearchesConfig = await getFromStore('settings', 'recent_searches');
  state.recentSearches = recentSearchesConfig?.value || [];

  renderSurahList();
  renderRecentSurahs();
  renderRecentSearches();

  const lastReadConfig = await getFromStore('settings', 'last_read');
  if (lastReadConfig) {
    state.lastRead = lastReadConfig.value;
    updateLastReadUI();
  }

  populateHifzSelectors();
  await hydrateDailyAyah();
  updateDashboardStats();
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeButton = document.getElementById(`tab-btn-${tabName}`);
  if (activeButton) activeButton.classList.add('active');

  document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(`${tabName}-view`);
  if (activeView) activeView.classList.add('active');

  const viewTitle = document.getElementById('active-view-title');
  if (viewTitle && activeButton) {
    const label = activeButton.querySelector('.tab-copy strong');
    viewTitle.innerText = label ? label.innerText : 'Holy Quran';
  }

  document.getElementById('reader-progress-shell').classList.toggle('hidden-section', tabName !== 'reader');

  if (tabName === 'bookmarks') loadBookmarksTab();
  if (tabName === 'settings') renderSettingsUI();

  if (tabName === 'hifz') {
    audioPlayer.stop();
  } else {
    hifzPlayer.stop();
  }
}

function applySidebarState() {
  document.body.classList.toggle('sidebar-collapsed', Boolean(state.settings.sidebarCollapsed));
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function showToast(title, message, tone = 'info') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  if (tone === 'warning') {
    toast.style.borderColor = 'rgba(249, 115, 22, 0.25)';
  }
  toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  toast.id = id;
  stack.appendChild(toast);

  const timeout = window.setTimeout(() => {
    toast.remove();
    toastTimeouts.delete(id);
  }, 3200);
  toastTimeouts.set(id, timeout);
}

function updateDashboardStats() {
  const bookmarkCount = state.bookmarks.length;
  document.getElementById('bookmark-count-value').innerText = String(bookmarkCount);
  document.getElementById('stats-bookmarks-count').innerText = String(bookmarkCount);
  document.getElementById('stats-recent-count').innerText = String(state.recentSurahs.length);

  const progressText = calculateReadingProgress();
  document.getElementById('reading-progress-value').innerText = progressText;

  const continueCopy = document.getElementById('continue-reading-copy');
  if (state.lastRead && continueCopy) {
    continueCopy.innerText = `Continue from ${state.lastRead.surahName}, ayah ${state.lastRead.ayah}.`;
  }
}

function calculateReadingProgress() {
  if (!state.lastRead) return '0%';
  const progress = Math.max(1, Math.round((state.lastRead.surah / 114) * 100));
  return `${progress}%`;
}

function getDailyAyahReference() {
  const date = new Date();
  const seed = date.getUTCFullYear() * 1000 + Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);
  return FEATURED_AYAH_POOL[seed % FEATURED_AYAH_POOL.length];
}

async function hydrateDailyAyah() {
  const reference = getDailyAyahReference();
  if (state.allVersesForSearch.length === 0) {
    state.allVersesForSearch = await getAllFromStore('verses');
  }

  const verse = state.allVersesForSearch.find(item => item.surah === reference.surah && item.ayah === reference.ayah);
  if (!verse) return;

  const surah = state.surahs.find(item => item.number === reference.surah);
  state.dailyAyah = verse;

  document.getElementById('hero-verse-arabic').innerText = verse.arabic;
  document.getElementById('hero-verse-translit').innerText = verse.transliteration;
  document.getElementById('hero-verse-translation').innerText = verse.english;
  document.getElementById('hero-verse-meta').innerText = `Surah ${surah ? surah.englishName : reference.surah} ${reference.surah}:${reference.ayah}`;
  document.getElementById('today-ayah-value').innerText = `${reference.surah}:${reference.ayah}`;
  document.getElementById('today-ayah-pill').innerText = `Today’s Ayah ${reference.surah}:${reference.ayah}`;
  document.getElementById('daily-ayah-summary').innerText = verse.english;
  document.getElementById('daily-ayah-ref').innerText = `Surah ${surah ? surah.englishName : reference.surah} ${reference.surah}:${reference.ayah}`;
  document.getElementById('hero-focus-title').innerText = surah ? surah.englishName : `Surah ${reference.surah}`;
  document.getElementById('hero-focus-subtitle').innerText = `Featured verse ${reference.surah}:${reference.ayah}`;
}

function renderSurahList(filteredList = null) {
  const listElement = document.getElementById('surah-list-items');
  listElement.innerHTML = '';

  const surahsToRender = filteredList || state.surahs;
  surahsToRender.forEach(surah => {
    const activeClass = state.currentSurah && state.currentSurah.number === surah.number ? 'active' : '';
    const progressHeight = getSurahProgressPercent(surah.number);

    const li = document.createElement('li');
    li.className = `list-item ${activeClass}`;
    li.dataset.number = surah.number;
    li.innerHTML = `
      <div class="surah-meta-left">
        <div class="surah-number">${surah.number}</div>
        <div class="surah-names">
          <div class="surah-eng-name">${surah.englishName}</div>
          <div class="surah-sub-info">${surah.revelationType} • ${surah.numberOfAyahs} Verses</div>
        </div>
      </div>
      <div class="surah-meta-right">
        <div class="surah-ar-name">${surah.name}</div>
        <div class="surah-sub-info">${surah.englishNameTranslation}</div>
      </div>
      <div class="surah-progress"><span style="height:${progressHeight}%"></span></div>
    `;

    li.addEventListener('click', () => {
      document.querySelectorAll('#surah-list-items .list-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadSurahReader(surah.number);
    });

    listElement.appendChild(li);
  });
}

function getSurahProgressPercent(surahNumber) {
  if (!state.lastRead || state.lastRead.surah !== surahNumber || !state.currentSurah) {
    return state.lastRead && state.lastRead.surah === surahNumber ? 35 : 0;
  }
  return Math.min(100, Math.round((state.lastRead.ayah / state.currentSurah.numberOfAyahs) * 100));
}

function filterSurahList(query) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    renderSurahList();
    return;
  }

  const filtered = state.surahs.filter(surah =>
    surah.number.toString().includes(normalizedQuery) ||
    surah.englishName.toLowerCase().includes(normalizedQuery) ||
    surah.englishNameTranslation.toLowerCase().includes(normalizedQuery) ||
    surah.name.includes(normalizedQuery)
  );

  renderSurahList(filtered);
}

async function loadSurahReader(surahNumber, targetAyah = null) {
  state.currentSurah = state.surahs.find(s => s.number === surahNumber);
  state.currentVerses = await getVersesBySurah(surahNumber);

  switchTab('reader');

  document.getElementById('reader-surah-ar-name').innerText = state.currentSurah.name;
  document.getElementById('reader-surah-eng-name').innerText = state.currentSurah.englishName;
  document.getElementById('reader-surah-translation').innerText = state.currentSurah.englishNameTranslation;
  document.getElementById('reader-surah-verses-count').innerText = `${state.currentSurah.numberOfAyahs} Verses`;
  document.getElementById('reader-surah-revelation').innerText = `${state.currentSurah.revelationType} Revelation`;

  const bismillahEl = document.getElementById('bismillah-decorator');
  if (surahNumber !== 1 && surahNumber !== 9) {
    bismillahEl.classList.remove('hidden-section');
  } else {
    bismillahEl.classList.add('hidden-section');
  }

  const versesContainer = document.getElementById('verses-list-container');
  versesContainer.innerHTML = '';

  state.currentVerses.forEach(verse => {
    const isBookmarked = state.bookmarks.some(b => b.surah_ayah === `${verse.surah}_${verse.ayah}`);
    const bookmarkIcon = isBookmarked ? 'fa fa-bookmark' : 'fa-regular fa-bookmark';

    const arabicHide = state.settings.showArabic ? '' : 'hidden-section';
    const transHide = state.settings.showTransliteration ? '' : 'hidden-section';
    const bnTransHide = state.settings.showBanglaTransliteration ? '' : 'hidden-section';
    const bnHide = state.settings.showBangla ? '' : 'hidden-section';
    const enHide = state.settings.showEnglish ? '' : 'hidden-section';

    const card = document.createElement('div');
    card.className = 'verse-card';
    card.id = `verse-card-${verse.surah}-${verse.ayah}`;
    card.innerHTML = `
      <div class="verse-top-controls">
        <span class="verse-number-badge">${verse.surah}:${verse.ayah}</span>
        <div class="verse-actions">
          <button class="verse-action-btn play-btn" onclick="playSingleVerse(${verse.surah}, ${verse.ayah})" title="Play Recitation">
            <i class="fa fa-circle-play"></i>
          </button>
          <button class="verse-action-btn bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${verse.surah}_${verse.ayah}', ${verse.surah}, ${verse.ayah})" title="Bookmark Verse">
            <i class="${bookmarkIcon}"></i>
          </button>
          <button class="verse-action-btn last-read-btn" onclick="markAsLastRead(${verse.surah}, ${verse.ayah})" title="Mark as Last Read">
            <i class="fa-regular fa-clock"></i>
          </button>
        </div>
      </div>
      <div class="verse-arabic ${arabicHide}" style="font-size:${2.2 * state.settings.fontSizeMultiplier}rem;">${verse.arabic}</div>
      <div class="verse-transliteration verse-trans-en ${transHide}" style="font-size:${1 * state.settings.fontSizeMultiplier}rem;">
        <span class="translation-label">English Pronunciation</span><br>
        ${verse.transliteration}
      </div>
      <div class="verse-transliteration verse-trans-bn ${bnTransHide}" style="font-size:${1 * state.settings.fontSizeMultiplier}rem; font-family: var(--font-sans);">
        <span class="translation-label">Bangla Pronunciation</span><br>
        ${verse.bangla_transliteration || ''}
      </div>
      <div class="verse-translation verse-bn ${bnHide}" style="font-size:${1.05 * state.settings.fontSizeMultiplier}rem;">
        <span class="translation-label">Bangla Meaning (Muhiuddin Khan)</span><br>
        ${verse.bangla}
      </div>
      <div class="verse-translation verse-en ${enHide}" style="font-size:${1.05 * state.settings.fontSizeMultiplier}rem;">
        <span class="translation-label">English Meaning (Saheeh International)</span><br>
        ${verse.english}
      </div>
    `;
    versesContainer.appendChild(card);
  });

  applyReaderFontStyles();
  await rememberRecentSurah(state.currentSurah);
  renderSurahList();
  renderRecentSurahs();
  updateReaderProgressFromScroll(true, targetAyah);

  const readerView = document.getElementById('reader-view');
  if (targetAyah) {
    setTimeout(() => {
      const card = document.getElementById(`verse-card-${surahNumber}-${targetAyah}`);
      if (card) {
        card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }
    }, 200);
  } else {
    readerView.scrollTop = 0;
  }
}

window.playSingleVerse = (surah, ayah) => {
  audioPlayer.playVerse(surah, ayah, state.currentVerses);
};

window.toggleBookmark = async (id, surahNum, ayahNum) => {
  const index = state.bookmarks.findIndex(b => b.surah_ayah === id);
  const card = document.getElementById(`verse-card-${surahNum}-${ayahNum}`);
  const btn = card ? card.querySelector('.bookmark-btn') : null;
  const icon = btn ? btn.querySelector('i') : null;

  if (index !== -1) {
    await deleteFromStore('bookmarks', id);
    state.bookmarks.splice(index, 1);
    if (btn) btn.classList.remove('active');
    if (icon) icon.className = 'fa-regular fa-bookmark';
    showToast('Bookmark removed', `Removed ayah ${surahNum}:${ayahNum} from your saved list.`, 'info');
  } else {
    const surah = state.surahs.find(s => s.number === surahNum);
    const verse = state.currentVerses.find(v => v.ayah === ayahNum);
    const bookmarkItem = {
      surah_ayah: id,
      surah: surahNum,
      ayah: ayahNum,
      surahName: surah.englishName,
      textPreview: `${verse.english.substring(0, 80)}...`,
      timestamp: Date.now()
    };
    await writeData('bookmarks', bookmarkItem);
    state.bookmarks.push(bookmarkItem);
    if (btn) btn.classList.add('active');
    if (icon) icon.className = 'fa fa-bookmark';
    showToast('Bookmark saved', `Saved ayah ${surahNum}:${ayahNum} to your bookmarks.`, 'info');
  }

  updateDashboardStats();
  if (document.getElementById('bookmarks-view').classList.contains('active')) {
    await loadBookmarksTab();
  }
};

window.markAsLastRead = async (surahNum, ayahNum) => {
  const surah = state.surahs.find(s => s.number === surahNum);
  const lastReadObj = {
    surah: surahNum,
    ayah: ayahNum,
    surahName: surah.englishName,
    timestamp: Date.now()
  };

  await writeData('settings', { key: 'last_read', value: lastReadObj });
  state.lastRead = lastReadObj;
  updateLastReadUI();
  updateDashboardStats();
  renderSurahList();
  showToast('Last read updated', `Saved ${surah.englishName} ayah ${ayahNum} as your current reading position.`, 'info');
};

function updateLastReadUI() {
  const widget = document.getElementById('last-read-widget-bar');
  if (state.lastRead) {
    widget.classList.remove('hidden-section');
    document.getElementById('last-read-title').innerText = `${state.lastRead.surahName} : Verse ${state.lastRead.ayah}`;

    const resumeBtn = document.getElementById('last-read-resume-btn');
    const newResumeBtn = resumeBtn.cloneNode(true);
    resumeBtn.parentNode.replaceChild(newResumeBtn, resumeBtn);
    newResumeBtn.addEventListener('click', () => {
      loadSurahReader(state.lastRead.surah, state.lastRead.ayah);
    });
  } else {
    widget.classList.add('hidden-section');
  }
}

async function loadBookmarksTab() {
  state.bookmarks = await getAllFromStore('bookmarks');
  const container = document.getElementById('bookmarks-list-container');
  container.innerHTML = '';

  if (state.bookmarks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-bookmark"></i>
        <p>No bookmarks saved yet. Add bookmarks while reading the Quran to see them here.</p>
      </div>
    `;
    return;
  }

  state.bookmarks.sort((a, b) => b.timestamp - a.timestamp).forEach(bookmark => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="search-result-header">
        <span>${bookmark.surahName} (Verse ${bookmark.ayah})</span>
        <button class="verse-action-btn" onclick="removeBookmarkDirect('${bookmark.surah_ayah}', event)" title="Remove bookmark">
          <i class="fa fa-trash"></i>
        </button>
      </div>
      <p class="search-match-text">${bookmark.textPreview}</p>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.verse-action-btn')) return;
      loadSurahReader(bookmark.surah, bookmark.ayah);
    });

    container.appendChild(card);
  });
}

window.removeBookmarkDirect = async (id, event) => {
  event.stopPropagation();
  await deleteFromStore('bookmarks', id);
  state.bookmarks = state.bookmarks.filter(item => item.surah_ayah !== id);
  await loadBookmarksTab();
  updateDashboardStats();
  showToast('Bookmark removed', 'The saved ayah has been removed from bookmarks.', 'info');
};

function renderSettingsUI() {
  document.getElementById('settings-theme').value = state.settings.theme;
  document.getElementById('settings-arabic-font').value = state.settings.arabicFont;
  document.getElementById('settings-font-scale').value = state.settings.fontSizeMultiplier;
  document.getElementById('settings-font-scale-val').innerText = `${Math.round(state.settings.fontSizeMultiplier * 100)}%`;
  document.getElementById('reader-font-scale-inline').value = state.settings.fontSizeMultiplier;

  document.getElementById('toggle-ar').checked = state.settings.showArabic;
  document.getElementById('toggle-trans').checked = state.settings.showTransliteration;
  document.getElementById('toggle-bn-trans').checked = state.settings.showBanglaTransliteration;
  document.getElementById('toggle-bn').checked = state.settings.showBangla;
  document.getElementById('toggle-en').checked = state.settings.showEnglish;

  const attachEventOnce = (id, event, handler) => {
    const el = document.getElementById(id);
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    newEl.addEventListener(event, handler);
  };

  attachEventOnce('settings-theme', 'change', async e => {
    state.settings.theme = e.target.value;
    document.body.setAttribute('data-theme', state.settings.theme);
    await saveSettings();
  });

  attachEventOnce('settings-arabic-font', 'change', async e => {
    state.settings.arabicFont = e.target.value;
    applyReaderFontStyles();
    await saveSettings();
  });

  attachEventOnce('settings-font-scale', 'input', async e => {
    const val = parseFloat(e.target.value);
    state.settings.fontSizeMultiplier = val;
    document.getElementById('settings-font-scale-val').innerText = `${Math.round(val * 100)}%`;
    document.getElementById('reader-font-scale-inline').value = String(val);
    applyReaderFontStyles();
    await saveSettings();
  });

  const setupToggle = (id, stateKey) => {
    attachEventOnce(id, 'change', async e => {
      state.settings[stateKey] = e.target.checked;
      applyVisibilitySettings();
      await saveSettings();
    });
  };

  setupToggle('toggle-ar', 'showArabic');
  setupToggle('toggle-trans', 'showTransliteration');
  setupToggle('toggle-bn-trans', 'showBanglaTransliteration');
  setupToggle('toggle-bn', 'showBangla');
  setupToggle('toggle-en', 'showEnglish');
};

function applyVisibilitySettings() {
  const container = document.getElementById('verses-list-container');
  if (!container) return;

  const toggleVisibility = (selector, isVisible) => {
    container.querySelectorAll(selector).forEach(el => {
      el.classList.toggle('hidden-section', !isVisible);
    });
  };

  toggleVisibility('.verse-arabic', state.settings.showArabic);
  toggleVisibility('.verse-trans-en', state.settings.showTransliteration);
  toggleVisibility('.verse-trans-bn', state.settings.showBanglaTransliteration);
  toggleVisibility('.verse-bn', state.settings.showBangla);
  toggleVisibility('.verse-en', state.settings.showEnglish);
}

async function saveSettings() {
  await writeData('settings', { key: 'app_config', value: state.settings });
}

function applyReaderFontStyles() {
  const container = document.getElementById('verses-list-container');
  if (!container) return;

  const fontFamily = state.settings.arabicFont === 'scheherazade' ? 'var(--font-arabic-alt)' : 'var(--font-arabic)';
  container.querySelectorAll('.verse-arabic').forEach(el => {
    el.style.fontFamily = fontFamily;
    el.style.fontSize = `${2.2 * state.settings.fontSizeMultiplier}rem`;
  });

  container.querySelectorAll('.verse-transliteration').forEach(el => {
    el.style.fontSize = `${1 * state.settings.fontSizeMultiplier}rem`;
  });

  container.querySelectorAll('.verse-translation').forEach(el => {
    el.style.fontSize = `${1.05 * state.settings.fontSizeMultiplier}rem`;
  });
}

function updateReaderProgressFromScroll(forceTop = false, targetAyah = null) {
  const readerView = document.getElementById('reader-view');
  const bar = document.getElementById('reader-progress-bar');
  if (!readerView || !bar) return;

  if (forceTop) {
    bar.style.width = targetAyah ? `${Math.min(100, Math.round((targetAyah / (state.currentVerses.length || 1)) * 100))}%` : '0%';
    return;
  }

  const maxScroll = readerView.scrollHeight - readerView.clientHeight;
  const progress = maxScroll > 0 ? (readerView.scrollTop / maxScroll) * 100 : 0;
  state.reader.progress = progress;
  bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

async function rememberRecentSurah(surah) {
  if (!surah) return;
  const entry = {
    number: surah.number,
    englishName: surah.englishName,
    name: surah.name,
    timestamp: Date.now()
  };

  state.recentSurahs = [entry, ...state.recentSurahs.filter(item => item.number !== surah.number)].slice(0, 5);
  await writeData('settings', { key: 'recent_surahs', value: state.recentSurahs });
}

function renderRecentSurahs() {
  const container = document.getElementById('recent-surahs-list');
  if (!container) return;
  container.innerHTML = '';

  if (state.recentSurahs.length === 0) {
    container.innerHTML = '<div class="mini-empty-state">Open a Surah to keep it here.</div>';
    return;
  }

  state.recentSurahs.forEach(item => {
    const button = document.createElement('button');
    button.className = 'mini-surah-card';
    button.type = 'button';
    button.innerHTML = `
      <div>
        <strong>${item.englishName}</strong>
        <small>${item.name}</small>
      </div>
      <span class="shortcut-pill">${item.number}</span>
    `;
    button.addEventListener('click', () => loadSurahReader(item.number));
    container.appendChild(button);
  });
}

function openSearchOverlay() {
  state.isSearchOverlayOpen = true;
  const overlay = document.getElementById('search-overlay');
  overlay.classList.remove('hidden-section');
  overlay.setAttribute('aria-hidden', 'false');
  renderRecentSearches();
  setTimeout(() => {
    document.getElementById('overlay-search-input').focus();
  }, 10);
}

function closeSearchOverlay() {
  state.isSearchOverlayOpen = false;
  const overlay = document.getElementById('search-overlay');
  overlay.classList.add('hidden-section');
  overlay.setAttribute('aria-hidden', 'true');
  stopVoiceSearch();
}

function saveRecentSearch(query) {
  if (!query) return;
  state.recentSearches = [query, ...state.recentSearches.filter(item => item !== query)].slice(0, 8);
  writeData('settings', { key: 'recent_searches', value: state.recentSearches }).catch(err => console.error(err));
  renderRecentSearches();
}

function renderRecentSearches() {
  const container = document.getElementById('recent-searches-list');
  if (!container) return;
  container.innerHTML = '';

  if (state.recentSearches.length === 0) {
    container.innerHTML = '<div class="mini-empty-state">No recent searches yet.</div>';
    return;
  }

  state.recentSearches.forEach(term => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'recent-search-item';
    item.innerHTML = `<strong>${term}</strong><span class="shortcut-pill">Go</span>`;
    item.addEventListener('click', () => {
      const input = document.getElementById('overlay-search-input');
      input.value = term;
      performOverlaySearch(term);
    });
    container.appendChild(item);
  });
}

function setupVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.isVoiceSearchAvailable = Boolean(SpeechRecognition);
  if (!SpeechRecognition) return;

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'en-US';
  voiceRecognition.interimResults = true;
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    state.isVoiceListening = true;
    document.getElementById('voice-search-btn').classList.add('listening');
    showToast('Voice search active', 'Speak your search term clearly. Arabic recognition depends on browser support.', 'info');
  };

  voiceRecognition.onresult = event => {
    const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ');
    const input = document.getElementById('overlay-search-input');
    input.value = transcript;
    performOverlaySearch(transcript);
  };

  voiceRecognition.onerror = event => {
    console.error('Voice search error:', event.error);
    showToast('Voice search stopped', 'The browser could not complete voice recognition. You can continue typing instead.', 'warning');
    stopVoiceSearch();
  };

  voiceRecognition.onend = () => {
    stopVoiceSearch(false);
  };
}

function toggleVoiceSearch() {
  if (!voiceRecognition) return;
  if (state.isVoiceListening) {
    stopVoiceSearch();
    return;
  }
  try {
    voiceRecognition.start();
  } catch (error) {
    console.error('Voice search start failed:', error);
  }
}

function stopVoiceSearch(stopRecognition = true) {
  state.isVoiceListening = false;
  const button = document.getElementById('voice-search-btn');
  if (button) button.classList.remove('listening');
  if (stopRecognition && voiceRecognition) {
    try {
      voiceRecognition.stop();
    } catch (error) {
      console.error(error);
    }
  }
}

async function performOverlaySearch(query) {
  const trimmed = query.trim();
  const summary = document.getElementById('overlay-results-summary');
  const container = document.getElementById('overlay-search-results');
  container.innerHTML = '';

  if (trimmed.length < 2) {
    summary.innerText = 'Start typing to search across the Quran.';
    return;
  }

  if (state.allVersesForSearch.length === 0) {
    state.allVersesForSearch = await getAllFromStore('verses');
  }

  const matches = findSearchMatches(trimmed, state.overlaySearchMode).slice(0, 80);
  summary.innerText = `Found ${matches.length} quick matches for “${trimmed}” in ${state.overlaySearchMode === 'all' ? 'all sources' : state.overlaySearchMode}.`;

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-circle-question"></i>
        <p>No verses matched that search yet. Try another keyword or switch language mode.</p>
      </div>
    `;
    return;
  }

  matches.forEach(match => {
    const surah = state.surahs.find(item => item.number === match.surah);
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="search-result-header">
        <span>${surah ? surah.englishName : `Surah ${match.surah}`} (Verse ${match.ayah})</span>
        <span>${match.surah}:${match.ayah}</span>
      </div>
      <p class="search-match-text" style="font-style: italic; color: var(--color-gold-300); margin-bottom: 0.5rem;">${match.transliteration}</p>
      <p class="search-match-text" style="margin-bottom: 0.5rem;">${match.bangla}</p>
      <p class="search-match-text">${match.english}</p>
      <p class="search-match-arabic">${match.arabic}</p>
    `;
    card.addEventListener('click', () => {
      saveRecentSearch(trimmed);
      closeSearchOverlay();
      loadSurahReader(match.surah, match.ayah);
    });
    container.appendChild(card);
  });
}

function findSearchMatches(query, mode = 'all') {
  const normalized = query.toLowerCase();
  const searchRegex = new RegExp(escapeRegExp(query), 'gi');

  return state.allVersesForSearch.reduce((acc, verse) => {
    const matchArabic = verse.arabic.includes(query);
    const matchEnglish = verse.english.toLowerCase().includes(normalized);
    const matchBangla = verse.bangla.includes(query);
    const matchTranslit = verse.transliteration.toLowerCase().includes(normalized);

    const modeMatches = {
      all: matchArabic || matchEnglish || matchBangla || matchTranslit,
      arabic: matchArabic,
      english: matchEnglish,
      bangla: matchBangla,
      transliteration: matchTranslit
    };

    if (!modeMatches[mode]) {
      return acc;
    }

    let arabic = verse.arabic;
    let english = verse.english;
    let bangla = verse.bangla;
    let transliteration = verse.transliteration;

    if (matchArabic) arabic = highlightText(arabic, query, searchRegex);
    if (matchEnglish) english = highlightText(english, query, searchRegex);
    if (matchBangla) bangla = highlightText(bangla, query, searchRegex);
    if (matchTranslit) transliteration = highlightText(transliteration, query, searchRegex);

    acc.push({
      ...verse,
      arabic,
      english,
      bangla,
      transliteration
    });
    return acc;
  }, []);
}

async function executeDeepSearch() {
  const queryInput = document.getElementById('quran-search-input');
  const query = queryInput.value.toLowerCase().trim();
  const rawQuery = queryInput.value.trim();
  const resultsContainer = document.getElementById('search-results-container');
  const summaryEl = document.getElementById('search-results-summary-text');

  if (rawQuery.length < 2) {
    showToast('Search needs more detail', 'Please enter at least two characters to search the Quran.', 'info');
    return;
  }

  resultsContainer.innerHTML = `
    <div class="empty-state">
      <i class="fa fa-spinner fa-spin" style="color: var(--color-gold-500);"></i>
      <p>Searching the database... This may take a moment on older devices.</p>
    </div>
  `;
  summaryEl.innerText = 'Searching...';

  if (state.allVersesForSearch.length === 0) {
    state.allVersesForSearch = await getAllFromStore('verses');
  }

  const matches = findSearchMatches(rawQuery, 'all');
  resultsContainer.innerHTML = '';
  summaryEl.innerText = `Found ${matches.length} matches for "${rawQuery}"`;
  saveRecentSearch(rawQuery);

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-circle-question"></i>
        <p>No verses matched your search terms. Try different keywords or spelling.</p>
      </div>
    `;
    return;
  }

  const renderLimit = Math.min(matches.length, 100);
  for (let i = 0; i < renderLimit; i++) {
    const verse = matches[i];
    const surah = state.surahs.find(s => s.number === verse.surah);
    const surahName = surah ? surah.englishName : `Surah ${verse.surah}`;

    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="search-result-header">
        <span>${surahName} (Verse ${verse.ayah})</span>
        <span>${verse.surah}:${verse.ayah}</span>
      </div>
      <p class="search-match-text" style="font-style: italic; color: var(--color-gold-300); margin-bottom: 0.5rem;">${verse.transliteration}</p>
      <p class="search-match-text" style="margin-bottom: 0.5rem;">${verse.bangla}</p>
      <p class="search-match-text">${verse.english}</p>
      <p class="search-match-arabic">${verse.arabic}</p>
    `;

    card.addEventListener('click', () => {
      loadSurahReader(verse.surah, verse.ayah);
    });

    resultsContainer.appendChild(card);
  }

  if (matches.length > 100) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'card-action-btn';
    loadMoreBtn.style.margin = '2rem auto';
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.style.maxWidth = '220px';
    loadMoreBtn.innerText = 'Show all matches';

    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.remove();
      for (let i = 100; i < matches.length; i++) {
        const verse = matches[i];
        const surah = state.surahs.find(s => s.number === verse.surah);
        const surahName = surah ? surah.englishName : `Surah ${verse.surah}`;

        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
          <div class="search-result-header">
            <span>${surahName} (Verse ${verse.ayah})</span>
            <span>${verse.surah}:${verse.ayah}</span>
          </div>
          <p class="search-match-text" style="font-style: italic; color: var(--color-gold-300); margin-bottom: 0.5rem;">${verse.transliteration}</p>
          <p class="search-match-text" style="margin-bottom: 0.5rem;">${verse.bangla}</p>
          <p class="search-match-text">${verse.english}</p>
          <p class="search-match-arabic">${verse.arabic}</p>
        `;

        card.addEventListener('click', () => {
          loadSurahReader(verse.surah, verse.ayah);
        });

        resultsContainer.appendChild(card);
      }
    });

    resultsContainer.appendChild(loadMoreBtn);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, term, compiledRegex = null) {
  const regex = compiledRegex || new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

async function loadLocalData(fileName, globalVarName, fallbackUrl) {
  if (window.location.protocol === 'file:') {
    await new Promise((resolve, reject) => {
      if (window[globalVarName]) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `./data/${fileName}.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load local database script: ./data/${fileName}.js. Please run "node convert.js" in the project directory first.`));
      document.head.appendChild(script);
    });
    return window[globalVarName];
  }

  try {
    const res = await fetch(`./data/${fileName}.json`);
    if (!res.ok) throw new Error('Local JSON not found');
    return await res.json();
  } catch (e) {
    try {
      await new Promise((resolve, reject) => {
        if (window[globalVarName]) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = `./data/${fileName}.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load local JS database script.'));
        document.head.appendChild(script);
      });
      return window[globalVarName];
    } catch (err) {
      if (fallbackUrl && fallbackUrl.startsWith('http')) {
        console.warn(`Local assets missing. Fetching fallback online resource: ${fallbackUrl}`);
        const res = await fetch(fallbackUrl);
        return await res.json();
      }
      throw err;
    }
  }
}

async function startDataSync() {
  document.getElementById('start-sync-btn').classList.add('hidden-section');

  const progressBox = document.getElementById('sync-progress-box');
  progressBox.classList.remove('hidden-section');

  const fill = document.getElementById('sync-progress-fill-bar');
  const status = document.getElementById('sync-status-label');

  const updateProgress = (percentage, message) => {
    fill.style.width = `${percentage}%`;
    status.innerText = message;
    console.log(`[Sync] ${percentage}%: ${message}`);
  };

  try {
    updateProgress(10, 'Loading Surah metadata list...');
    const metadataJson = await loadLocalData('surahs', 'quranSurahs', 'https://api.alquran.cloud/v1/surah');
    const surahMetadataList = metadataJson.data;

    updateProgress(20, 'Writing Surah list to database...');
    await writeData('surahs', surahMetadataList);

    updateProgress(30, 'Loading full Arabic text...');
    const arabicJson = await loadLocalData('quran-uthmani', 'quranArabic', 'https://api.alquran.cloud/v1/quran/quran-uthmani');
    const arabicSurahs = arabicJson.data.surahs;

    updateProgress(45, 'Loading full Bangla translation...');
    const banglaJson = await loadLocalData('bn.bengali', 'quranBangla', 'https://api.alquran.cloud/v1/quran/bn.bengali');
    const banglaSurahs = banglaJson.data.surahs;

    updateProgress(60, 'Loading full English translation...');
    const englishJson = await loadLocalData('en.sahih', 'quranEnglish', 'https://api.alquran.cloud/v1/quran/en.sahih');
    const englishSurahs = englishJson.data.surahs;

    updateProgress(75, 'Loading English transliteration pronunciation...');
    const translitJson = await loadLocalData('en.transliteration', 'quranTranslit', 'https://api.alquran.cloud/v1/quran/en.transliteration');
    const translitSurahs = translitJson.data.surahs;

    updateProgress(80, 'Loading Bangla pronunciation database...');
    const bnTransJson = await loadLocalData('bangla_pronunciation', 'banglaPronunciation', './data/bangla_pronunciation.json');

    updateProgress(85, 'Compiling and saving 6,236 verses to offline database...');

    const versesToWrite = [];
    let absoluteVerseCount = 0;
    for (let sIdx = 0; sIdx < 114; sIdx++) {
      const arSurah = arabicSurahs[sIdx];
      const bnSurah = banglaSurahs[sIdx];
      const enSurah = englishSurahs[sIdx];
      const trSurah = translitSurahs[sIdx];
      const surahNum = arSurah.number;

      const numAyahs = arSurah.ayahs.length;
      for (let aIdx = 0; aIdx < numAyahs; aIdx++) {
        absoluteVerseCount++;
        const arAyah = arSurah.ayahs[aIdx];
        const bnAyah = bnSurah.ayahs[aIdx];
        const enAyah = enSurah.ayahs[aIdx];
        const trAyah = trSurah.ayahs[aIdx];
        const ayahNum = arAyah.numberInSurah;

        const lookupKey = ayahNum === 1 ? `${surahNum}_1` : `${absoluteVerseCount}_${ayahNum}`;
        let banglaTranslit = bnTransJson[lookupKey] || '';

        if (surahNum === 26 && ayahNum === 1) {
          banglaTranslit = 'তা-ছিম মীম।';
        } else if (surahNum === 26 && ayahNum === 227) {
          banglaTranslit = 'ইল্লাল্লাযীনা আ-মানূ ওয়া ‘আমিলুস সালিহা-তি ওয়া যাকারুল্লা-হা কাছীরাওঁ ওয়ানতাছারূ মিম বা‘দি মা-জুলিমূ; ওয়া ছাইয়া‘লামুল্লাযীনা জলামূ আইয়া মুনকালাবিইঁ ইয়ানকালিবূ ন।';
        }

        versesToWrite.push({
          number: arAyah.number,
          surah: surahNum,
          ayah: ayahNum,
          arabic: arAyah.text,
          bangla: bnAyah.text,
          english: enAyah.text,
          transliteration: trAyah.text,
          bangla_transliteration: banglaTranslit
        });
      }
    }

    await writeData('verses', versesToWrite);
    await writeData('settings', { key: 'sync_completed', value: true });
    await writeData('settings', { key: 'has_bn_trans', value: true });
    await writeData('settings', { key: 'bn_trans_fixed_v2', value: true });

    updateProgress(100, 'Database sync complete! Launching app...');

    setTimeout(async () => {
      document.getElementById('sync-overlay').classList.add('hidden-section');
      await loadAppData();
      showToast('Offline setup complete', 'The Quran database is now ready for offline reading and search.', 'info');
    }, 1000);
  } catch (error) {
    console.error('Data synchronization failed:', error);
    updateProgress(0, 'Sync failed! Tap below to try again.');
    document.getElementById('start-sync-btn').classList.remove('hidden-section');
    document.getElementById('start-sync-btn').innerText = 'Retry Synchronization';

    if (window.location.protocol === 'file:') {
      showToast('Local file security blocked sync', `Run "node convert.js" or use a local web server. ${error.message}`, 'warning');
    } else {
      showToast('Sync failed', 'Failed to synchronize Quran database. Please check your internet connection and try again.', 'warning');
    }
  }
}

let hifzPlayer = {
  audio: new Audio(),
  isPlaying: false,
  isPaused: false,
  playlist: [],
  currentIndex: 0,
  currentRepeatCount: 1,
  currentLoopCount: 1,
  verseRepeatsLimit: 1,
  loopRepeatsLimit: 1,
  delaySeconds: 0,
  activeVerseCard: null,
  delayTimeout: null,

  init() {
    this.audio.addEventListener('ended', () => this.handleVerseEnded());
    this.audio.addEventListener('error', e => {
      if (!this.audio.getAttribute('src')) return;
      console.error('Hifz audio error:', e);
      showToast('Hifz audio unavailable', 'Hifz recitation streaming requires an internet connection.', 'warning');
      this.stop();
    });
  },

  async start(surahNum, startAyah, endAyah, repeats, loops, delay) {
    this.stop();

    this.verseRepeatsLimit = parseInt(repeats, 10);
    this.loopRepeatsLimit = loops === 'infinite' ? 'infinite' : parseInt(loops, 10);
    this.delaySeconds = delay === 'auto' ? 'auto' : parseInt(delay, 10);

    const allSurahVerses = await getVersesBySurah(surahNum);
    this.playlist = allSurahVerses.filter(v => v.ayah >= startAyah && v.ayah <= endAyah);

    if (this.playlist.length === 0) {
      showToast('Invalid range', 'The selected ayah range could not be loaded for Hifz playback.', 'warning');
      return;
    }

    this.currentIndex = 0;
    this.currentRepeatCount = 1;
    this.currentLoopCount = 1;
    this.isPlaying = true;
    this.isPaused = false;

    document.getElementById('hifz-pause-resume-btn').disabled = false;
    document.getElementById('hifz-stop-btn').disabled = false;
    document.getElementById('hifz-pause-resume-btn').innerText = 'Pause';

    renderHifzVersesList();
    this.playActive();
  },

  playActive() {
    if (!this.isPlaying) return;

    const verse = this.playlist[this.currentIndex];
    if (!verse) return;

    const surah = state.surahs.find(s => s.number === verse.surah);
    document.getElementById('hifz-playing-title').innerText = `Reciting: ${surah.englishName}`;
    document.getElementById('hifz-playing-meta').innerText = `Ayah ${verse.ayah} of Surah ${surah.number}`;
    document.getElementById('hifz-progress-ayah').innerText = `${verse.ayah} (of range ${this.playlist[0].ayah} - ${this.playlist[this.playlist.length - 1].ayah})`;
    document.getElementById('hifz-progress-repeat').innerText = `${this.currentRepeatCount} of ${this.verseRepeatsLimit}`;
    document.getElementById('hifz-progress-loop').innerText = typeof this.loopRepeatsLimit === 'number' ? `${this.currentLoopCount} of ${this.loopRepeatsLimit}` : `${this.currentLoopCount} (Infinite)`;
    document.getElementById('hifz-play-state-icon').className = 'fa-solid fa-circle-notch fa-spin';

    this.highlightVerseCard(verse.surah, verse.ayah);

    this.audio.src = audioPlayer.getAudioUrl(verse.surah, verse.ayah);
    this.audio.play().then(() => {
      document.getElementById('hifz-play-state-icon').className = 'fa-solid fa-volume-high';
    }).catch(err => {
      console.error('Hifz audio play failed:', err);
      showToast('Recitation playback failed', 'Could not stream recitation audio. Verify your internet connection.', 'warning');
      this.stop();
    });
  },

  handleVerseEnded() {
    if (!this.isPlaying) return;

    if (this.currentRepeatCount < this.verseRepeatsLimit) {
      this.currentRepeatCount++;
      this.waitAndPlay();
    } else {
      this.currentRepeatCount = 1;

      if (this.currentIndex + 1 < this.playlist.length) {
        this.currentIndex++;
        this.waitAndPlay();
      } else {
        this.currentIndex = 0;

        if (this.loopRepeatsLimit === 'infinite') {
          this.currentLoopCount++;
          this.waitAndPlay();
        } else if (this.currentLoopCount < this.loopRepeatsLimit) {
          this.currentLoopCount++;
          this.waitAndPlay();
        } else {
          this.stop(true);
        }
      }
    }
  },

  waitAndPlay() {
    document.getElementById('hifz-play-state-icon').className = 'fa-solid fa-hourglass-half';

    let delayMs = 0;
    if (this.delaySeconds === 'auto') {
      delayMs = (this.audio.duration || 3) * 1000;
    } else {
      delayMs = this.delaySeconds * 1000;
    }

    this.delayTimeout = setTimeout(() => {
      this.playActive();
    }, delayMs);
  },

  togglePauseResume() {
    if (!this.isPlaying) return;

    if (this.isPaused) {
      this.isPaused = false;
      document.getElementById('hifz-pause-resume-btn').innerText = 'Pause';
      this.audio.play();
    } else {
      this.isPaused = true;
      document.getElementById('hifz-pause-resume-btn').innerText = 'Resume';
      this.audio.pause();
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
    }
  },

  stop(completed = false) {
    if (this.delayTimeout) clearTimeout(this.delayTimeout);
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.isPlaying = false;
    this.isPaused = false;
    this.playlist = [];
    this.removeHighlights();

    const pauseBtn = document.getElementById('hifz-pause-resume-btn');
    const stopBtn = document.getElementById('hifz-stop-btn');
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (pauseBtn) pauseBtn.innerText = 'Pause';

    document.getElementById('hifz-play-state-icon').className = 'fa-solid fa-volume-high';

    if (completed) {
      document.getElementById('hifz-playing-title').innerText = 'Hifz Loop Completed';
      document.getElementById('hifz-playing-meta').innerText = 'Barakallah! Range successfully memorized.';
      showToast('Hifz loop completed', 'Barakallah. The memorization loop finished successfully.', 'info');
    } else {
      document.getElementById('hifz-playing-title').innerText = 'Player Standby';
      document.getElementById('hifz-playing-meta').innerText = 'Setup a range and press start.';
    }

    document.getElementById('hifz-progress-ayah').innerText = '-';
    document.getElementById('hifz-progress-repeat').innerText = '-';
    document.getElementById('hifz-progress-loop').innerText = '-';
  },

  highlightVerseCard(surah, ayah) {
    this.removeHighlights();
    const card = document.getElementById(`hifz-card-${surah}-${ayah}`);
    if (card) {
      card.classList.add('hifz-active');
      card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      this.activeVerseCard = card;
    }
  },

  removeHighlights() {
    if (this.activeVerseCard) {
      this.activeVerseCard.classList.remove('hifz-active');
      this.activeVerseCard = null;
    }
  }
};

function populateHifzSelectors() {
  const surahSelect = document.getElementById('hifz-surah-select');
  if (!surahSelect) return;

  surahSelect.innerHTML = '';
  state.surahs.forEach(surah => {
    const opt = document.createElement('option');
    opt.value = surah.number;
    opt.text = `${surah.number}. ${surah.englishName} (${surah.name})`;
    surahSelect.appendChild(opt);
  });

  updateHifzAyahRange(1);
}

function updateHifzAyahRange(surahNumber) {
  const surah = state.surahs.find(s => s.number === surahNumber);
  if (!surah) return;

  const startInput = document.getElementById('hifz-start-ayah');
  const endInput = document.getElementById('hifz-end-ayah');

  startInput.max = surah.numberOfAyahs;
  endInput.max = surah.numberOfAyahs;
  startInput.value = 1;
  endInput.value = Math.min(surah.numberOfAyahs, 7);
}

function renderHifzVersesList() {
  const container = document.getElementById('hifz-verses-container');
  container.innerHTML = '';

  const hideArabic = document.getElementById('hifz-toggle-arabic').checked;
  const hideTranslit = document.getElementById('hifz-toggle-trans').checked;
  const hideBnTranslit = document.getElementById('hifz-toggle-bn-trans').checked;
  const hideBangla = document.getElementById('hifz-toggle-bangla').checked;

  hifzPlayer.playlist.forEach(verse => {
    const card = document.createElement('div');
    card.className = 'verse-card';
    card.id = `hifz-card-${verse.surah}-${verse.ayah}`;

    let arabicContent = `<div class="verse-arabic" style="font-size:${2.2 * state.settings.fontSizeMultiplier}rem;">${verse.arabic}</div>`;
    if (hideArabic) {
      arabicContent = `
        <div class="hifz-hide-container">
          <div class="hifz-reveal-overlay arabic-overlay" onclick="revealHifzContent(this)"><span>Tap to Reveal Arabic</span></div>
          <div class="verse-arabic" style="font-size:${2.2 * state.settings.fontSizeMultiplier}rem; visibility:hidden;">${verse.arabic}</div>
        </div>
      `;
    }

    let translitContent = `
      <div class="verse-transliteration verse-trans-en" style="font-size:${1 * state.settings.fontSizeMultiplier}rem;">
        <span class="translation-label">English Pronunciation</span><br>
        ${verse.transliteration}
      </div>
    `;
    if (hideTranslit) {
      translitContent = `
        <div class="hifz-hide-container">
          <div class="hifz-reveal-overlay" onclick="revealHifzContent(this)"><span>Tap to Reveal English Pronunciation</span></div>
          <div class="verse-transliteration verse-trans-en" style="font-size:${1 * state.settings.fontSizeMultiplier}rem; visibility:hidden;">
            <span class="translation-label">English Pronunciation</span><br>
            ${verse.transliteration}
          </div>
        </div>
      `;
    }

    let bnTranslitContent = `
      <div class="verse-transliteration verse-trans-bn" style="font-size:${1 * state.settings.fontSizeMultiplier}rem; font-family: var(--font-sans);">
        <span class="translation-label">Bangla Pronunciation</span><br>
        ${verse.bangla_transliteration || ''}
      </div>
    `;
    if (hideBnTranslit) {
      bnTranslitContent = `
        <div class="hifz-hide-container">
          <div class="hifz-reveal-overlay" onclick="revealHifzContent(this)"><span>Tap to Reveal Bangla Pronunciation</span></div>
          <div class="verse-transliteration verse-trans-bn" style="font-size:${1 * state.settings.fontSizeMultiplier}rem; font-family: var(--font-sans); visibility:hidden;">
            <span class="translation-label">Bangla Pronunciation</span><br>
            ${verse.bangla_transliteration || ''}
          </div>
        </div>
      `;
    }

    let banglaContent = `
      <div class="verse-translation verse-bn" style="font-size:${1.05 * state.settings.fontSizeMultiplier}rem;">
        <span class="translation-label">Bangla Meaning</span><br>
        ${verse.bangla}
      </div>
    `;
    if (hideBangla) {
      banglaContent = `
        <div class="hifz-hide-container">
          <div class="hifz-reveal-overlay" onclick="revealHifzContent(this)"><span>Tap to Reveal Bangla Meaning</span></div>
          <div class="verse-translation verse-bn" style="font-size:${1.05 * state.settings.fontSizeMultiplier}rem; visibility:hidden;">
            <span class="translation-label">Bangla Meaning</span><br>
            ${verse.bangla}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="verse-top-controls">
        <span class="verse-number-badge">${verse.surah}:${verse.ayah}</span>
      </div>
      ${arabicContent}
      ${translitContent}
      ${bnTranslitContent}
      ${banglaContent}
    `;

    container.appendChild(card);
  });
}

window.revealHifzContent = overlayElement => {
  overlayElement.style.display = 'none';
  const contentElement = overlayElement.nextElementSibling;
  if (contentElement) {
    contentElement.style.visibility = 'visible';
  }
};