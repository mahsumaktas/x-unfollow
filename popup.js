// Popup Script - X Unfollow Tool (Tab Bar UI)

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const previewBtn = document.getElementById('previewBtn');
  const previewModal = document.getElementById('previewModal');
  const previewCancel = document.getElementById('previewCancel');
  const previewConfirm = document.getElementById('previewConfirm');
  const runningBtns = document.getElementById('runningBtns');
  const whitelist = document.getElementById('whitelist');
  const statusBadge = document.getElementById('statusBadge');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const unfollowedCount = document.getElementById('unfollowedCount');
  const skippedCount = document.getElementById('skippedCount');
  const scannedCount = document.getElementById('scannedCount');
  const logArea = document.getElementById('logArea');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const speedSelect = document.getElementById('speedSelect');
  const limitInput = document.getElementById('limitInput');
  const whitelistValidation = document.getElementById('whitelistValidation');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleIcon = document.getElementById('themeToggleIcon');

  // Filter Elements
  const inactiveSettings = document.getElementById('inactiveSettings');
  const bioSettings = document.getElementById('bioSettings');
  const bioActionSettings = document.getElementById('bioActionSettings');
  const inactiveDaysSelect = document.getElementById('inactiveDaysSelect');
  const minFollowersInput = document.getElementById('minFollowersInput');
  const bioKeywordsInput = document.getElementById('bioKeywordsInput');
  const bioActionSelect = document.getElementById('bioActionSelect');
  const followedCount = document.getElementById('followedCount');
  const followedStat = document.getElementById('followedStat');
  const overactiveSettings = document.getElementById('overactiveSettings');
  const overactiveThresholdInput = document.getElementById('overactiveThresholdInput');

  // Settings tab elements
  const skipVerifiedCheck = document.getElementById('skipVerifiedCheck');
  const demoModeCheck = document.getElementById('demoModeCheck');
  const timerInput = document.getElementById('timerInput');
  const targetInput = document.getElementById('targetInput');
  const notifSoundCheck = document.getElementById('notifSoundCheck');
  const langSelect = document.getElementById('langSelect');
  const themeSelect = document.getElementById('themeSelect');

  // Stats Dashboard Elements
  const dashAllTime = document.getElementById('dashAllTime');
  const dashThisWeek = document.getElementById('dashThisWeek');
  const dashSessions = document.getElementById('dashSessions');
  const dashNonFollowerRate = document.getElementById('dashNonFollowerRate');

  // Export/Import Elements
  const exportBtn = document.getElementById('exportBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const importBtn = document.getElementById('importBtn');
  const exportImportArea = document.getElementById('exportImportArea');
  const exportImportStatus = document.getElementById('exportImportStatus');

  // History & Log
  const historyArea = document.getElementById('historyArea');
  const clearLogs = document.getElementById('clearLogs');
  const clearHistory = document.getElementById('clearHistory');

  // Review Prompt Elements
  const reviewPrompt = document.getElementById('reviewPrompt');
  const reviewYes = document.getElementById('reviewYes');
  const reviewLater = document.getElementById('reviewLater');
  const reviewNo = document.getElementById('reviewNo');

  // Tab Bar Elements
  const tabBar = document.querySelector('.tab-bar');
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');

  // Helper: safely get active tab
  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  }

  // Helper: send message with retry
  async function sendMessageWithRetry(tabId, msg, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try { return await chrome.tabs.sendMessage(tabId, msg); }
      catch (e) { if (i === retries) throw e; await new Promise(r => setTimeout(r, 500)); }
    }
  }

  // State
  let currentlyPaused = false;
  let lastPageValid = false;

  // Username validation regex
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,15}$/;

  // === TAB SWITCHING ===
  function switchTab(tabId) {
    tabContents.forEach(tc => tc.classList.remove('active'));
    tabItems.forEach(ti => {
      ti.classList.remove('active');
      ti.setAttribute('aria-selected', 'false');
    });
    const panel = document.getElementById(tabId);
    const tab = tabBar.querySelector(`[data-tab="${tabId}"]`);
    if (panel) panel.classList.add('active');
    if (tab) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
    chrome.storage.session.set({ activeTab: tabId });
    if (tabId === 'tabSettingsContent') loadStatsDashboard();
  }

  tabItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.getAttribute('data-tab')));
    item.addEventListener('keydown', (e) => {
      const tabs = Array.from(tabItems);
      const idx = tabs.indexOf(item);
      let target = idx;
      if (e.key === 'ArrowLeft') target = idx > 0 ? idx - 1 : tabs.length - 1;
      else if (e.key === 'ArrowRight') target = idx < tabs.length - 1 ? idx + 1 : 0;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[target].focus();
      switchTab(tabs[target].getAttribute('data-tab'));
    });
  });

  // Apply translations to UI
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.closest('#langSelect')) return;
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      if (el.closest('#langSelect')) return;
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
    // Defensive: always restore native language names in the selector
    const langOptions = {
      auto: 'Auto', tr: 'Türkçe', en: 'English',
      es: 'Español', de: 'Deutsch', fr: 'Français', ar: 'العربية',
      ja: '日本語', pt: 'Português', zh: '中文'
    };
    const langSelectEl = document.getElementById('langSelect');
    if (langSelectEl) {
      langSelectEl.querySelectorAll('option').forEach(opt => {
        if (langOptions[opt.value]) opt.textContent = langOptions[opt.value];
      });
    }
    // Re-render dynamic components that use t()
    const selectedMode = document.querySelector('input[name="mode"]:checked')?.value
      || document.querySelector('.mode-list-item.selected')?.dataset?.modevalue
      || 'non-followers';
    if (typeof updateModeCard === 'function') updateModeCard(selectedMode);
    // Re-render theme toggle text
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (typeof updateThemeToggleIcon === 'function') updateThemeToggleIcon(currentTheme);
  }

  // Load saved settings
  const saved = await chrome.storage.local.get(['whitelist', 'mode', 'stats', 'lang', 'logs', 'speed', 'limit', 'history', 'theme', 'inactiveDays', 'minFollowers', 'bioKeywords', 'bioAction', 'demoMode', 'skipVerified', 'timerMinutes', 'targetProfile', 'notifSound', 'cumulativeStats', 'overactiveThreshold']);

  // Storage validation: ensure expected types
  if (saved.whitelist && typeof saved.whitelist !== 'string') saved.whitelist = '';
  if (saved.mode && typeof saved.mode !== 'string') saved.mode = 'non-followers';
  if (saved.speed && typeof saved.speed !== 'string') saved.speed = '1';
  if (saved.limit && typeof saved.limit !== 'number') saved.limit = parseInt(saved.limit) || 0;
  if (saved.logs && !Array.isArray(saved.logs)) saved.logs = [];
  if (saved.history && !Array.isArray(saved.history)) saved.history = [];
  if (saved.bioKeywords && typeof saved.bioKeywords !== 'string') saved.bioKeywords = '';

  // Migration: egghead/ghost → inactive (ghost merged into inactive)
  if (saved.mode === 'egghead' || saved.mode === 'ghost') {
    saved.mode = 'inactive';
    chrome.storage.local.set({ mode: 'inactive' });
  }

  if (saved.whitelist) whitelist.value = saved.whitelist;
  if (saved.mode) {
    const radio = document.querySelector(`input[name="mode"][value="${CSS.escape(saved.mode)}"]`);
    if (radio) radio.checked = true;
  }
  if (saved.stats) {
    unfollowedCount.textContent = saved.stats.unfollowed || 0;
    skippedCount.textContent = saved.stats.skipped || 0;
    scannedCount.textContent = saved.stats.scanned || 0;
  }
  if (saved.lang) {
    langSelect.value = saved.lang;
    if (saved.lang !== 'auto') {
      window.i18n.forcedLang = saved.lang;
    }
  }
  if (saved.logs) {
    saved.logs.forEach(log => addLogItem(log.message, log.type, false));
  }
  if (saved.speed) {
    speedSelect.value = saved.speed;
  }
  if (saved.limit) {
    limitInput.value = saved.limit;
  }
  if (saved.history) {
    renderHistory(saved.history);
  }
  if (saved.theme) {
    themeSelect.value = saved.theme;
    document.documentElement.setAttribute('data-theme', saved.theme);
  }
  if (saved.inactiveDays) {
    inactiveDaysSelect.value = saved.inactiveDays;
  }
  if (saved.minFollowers) {
    minFollowersInput.value = saved.minFollowers;
  }
  if (saved.bioKeywords) {
    bioKeywordsInput.value = saved.bioKeywords;
  }
  if (saved.bioAction) {
    bioActionSelect.value = saved.bioAction;
  }
  if (saved.skipVerified) {
    skipVerifiedCheck.checked = true;
  }
  if (saved.demoMode) {
    demoModeCheck.checked = true;
  }
  if (saved.timerMinutes) {
    timerInput.value = saved.timerMinutes;
  }
  if (saved.targetProfile) {
    targetInput.value = saved.targetProfile;
  }
  if (saved.notifSound) {
    chrome.permissions.contains({ permissions: ['notifications'] }, (has) => {
      notifSoundCheck.checked = has;
      if (!has) chrome.storage.local.set({ notifSound: false });
    });
  }
  if (saved.overactiveThreshold) {
    overactiveThresholdInput.value = saved.overactiveThreshold;
  }

  // Restore last active tab from session storage
  const sessionData = await chrome.storage.session.get(['activeTab']);
  if (sessionData.activeTab && document.getElementById(sessionData.activeTab)) {
    switchTab(sessionData.activeTab);
  }

  // Apply initial filter visibility
  updateFilterVisibility(saved.mode || 'non-followers');

  applyTranslations();
  updateThemeToggleIcon(saved.theme || 'dark');

  // Rate button
  document.getElementById('rateBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/cpeaigkbonkmgamcdeoflbalglkffeag?utm_source=item-share-cb' });
  });

  // Language change
  langSelect.addEventListener('change', () => {
    const lang = langSelect.value;
    chrome.storage.local.set({ lang });
    if (lang === 'auto') {
      delete window.i18n.forcedLang;
    } else {
      window.i18n.forcedLang = lang;
    }
    applyTranslations();
    checkPage();
  });

  // Theme change (settings select)
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    applyTheme(theme);
  });

  // Theme toggle button (header)
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    themeSelect.value = next;
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    chrome.storage.local.set({ theme });
    updateThemeToggleIcon(theme);
  }

  function updateThemeToggleIcon(theme) {
    const themeTextEl = document.getElementById('themeToggleText');
    if (theme === 'light') {
      themeToggleIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
      if (themeTextEl) { themeTextEl.setAttribute('data-i18n', 'themeLight'); themeTextEl.textContent = t('themeLight'); }
    } else {
      themeToggleIcon.innerHTML = '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';
      if (themeTextEl) { themeTextEl.setAttribute('data-i18n', 'themeDark'); themeTextEl.textContent = t('themeDark'); }
    }
  }

  // Save whitelist on change with validation
  whitelist.addEventListener('input', () => {
    chrome.storage.local.set({ whitelist: whitelist.value });
    validateWhitelist();
  });

  function validateWhitelist() {
    const lines = whitelist.value.split('\n').map(u => u.trim().replace('@', '')).filter(u => u.length > 0);
    if (lines.length === 0) {
      whitelistValidation.textContent = '';
      whitelistValidation.className = 'hint';
      return;
    }
    let valid = 0;
    let invalid = 0;
    lines.forEach(u => {
      if (USERNAME_REGEX.test(u)) {
        valid++;
      } else {
        invalid++;
      }
    });
    if (invalid > 0) {
      whitelistValidation.textContent = t('whitelistValidCount', { valid, invalid });
      whitelistValidation.className = 'hint hint-error';
    } else {
      whitelistValidation.textContent = t('whitelistValidCount', { valid, invalid: 0 });
      whitelistValidation.className = 'hint hint-success';
    }
  }

  // Filter visibility based on mode
  function updateFilterVisibility(mode) {
    inactiveSettings.classList.toggle('active', mode === 'inactive');
    bioSettings.classList.toggle('active', mode === 'bio-filter');
    bioActionSettings.classList.toggle('active', mode === 'bio-filter');
    if (overactiveSettings) {
      overactiveSettings.classList.toggle('active', mode === 'overactive');
    }
    if (followedStat) {
      followedStat.classList.toggle('hidden', mode !== 'follow-all');
    }
  }

  // Save mode on change
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const selected = getSelectedMode();
      chrome.storage.local.set({ mode: selected });
      updateFilterVisibility(selected);
    });
  });

  // Save speed on change
  speedSelect.addEventListener('change', async () => {
    const speed = parseFloat(speedSelect.value);
    chrome.storage.local.set({ speed: speedSelect.value });
    try {
      const tab = await getActiveTab();
      if (!tab) return;
      await chrome.tabs.sendMessage(tab.id, { action: 'updateSpeed', speed });
    } catch (e) { }
  });

  // Save limit on change
  limitInput.addEventListener('change', () => {
    const limit = parseInt(limitInput.value) || 0;
    limitInput.value = limit;
    chrome.storage.local.set({ limit });
  });

  // Save filter settings on change
  inactiveDaysSelect.addEventListener('change', () => {
    chrome.storage.local.set({ inactiveDays: inactiveDaysSelect.value });
  });
  minFollowersInput.addEventListener('change', () => {
    chrome.storage.local.set({ minFollowers: minFollowersInput.value });
  });
  bioKeywordsInput.addEventListener('input', () => {
    chrome.storage.local.set({ bioKeywords: bioKeywordsInput.value });
  });
  bioActionSelect.addEventListener('change', () => {
    chrome.storage.local.set({ bioAction: bioActionSelect.value });
  });

  // Save settings tab options
  skipVerifiedCheck.addEventListener('change', () => {
    chrome.storage.local.set({ skipVerified: skipVerifiedCheck.checked });
  });
  demoModeCheck.addEventListener('change', () => {
    chrome.storage.local.set({ demoMode: demoModeCheck.checked });
  });
  timerInput.addEventListener('change', () => {
    chrome.storage.local.set({ timerMinutes: parseInt(timerInput.value) || 0 });
  });
  targetInput.addEventListener('input', () => {
    chrome.storage.local.set({ targetProfile: targetInput.value.trim() });
  });
  notifSoundCheck.addEventListener('change', async () => {
    if (notifSoundCheck.checked) {
      try {
        const granted = await chrome.permissions.request({ permissions: ['notifications'] });
        if (!granted) {
          notifSoundCheck.checked = false;
          addLog(t('notifPermissionDenied'), 'warning');
        }
      } catch { notifSoundCheck.checked = false; }
    }
    chrome.storage.local.set({ notifSound: notifSoundCheck.checked });
  });
  overactiveThresholdInput.addEventListener('change', () => {
    chrome.storage.local.set({ overactiveThreshold: parseInt(overactiveThresholdInput.value) || 50 });
  });

  // Clear logs / history
  clearLogs.addEventListener('click', () => {
    logArea.innerHTML = '';
    chrome.storage.local.set({ logs: [] });
  });

  clearHistory.addEventListener('click', () => {
    historyArea.innerHTML = '';
    chrome.storage.local.set({ history: [] });
    renderHistory([]);
  });

  // Check if on correct page
  async function checkPage() {
    try {
      const tab = await getActiveTab();
      if (!tab) {
        lastPageValid = false;
        showStatus('warning', '\u26A0\uFE0F', t('statusGoToFollowing'));
        updateStartButton(t('btnOpenX'), false);
        return { valid: false, needsRedirect: true, hasUsername: false };
      }
      const url = tab.url || '';
      const isXDomain = url.includes('x.com') || url.includes('twitter.com');
      const isFollowingPage = isXDomain && url.includes('/following');
      const isListPage = isXDomain && /\/i\/lists\/\d+/.test(url);
      const isValidPage = isFollowingPage || isListPage;

      if (!isXDomain) {
        lastPageValid = false;
        showStatus('warning', '\u26A0\uFE0F', t('statusGoToFollowing'));
        updateStartButton(t('btnOpenX'), false);
        return { valid: false, needsRedirect: true, hasUsername: false };
      }

      if (!isValidPage) {
        const username = extractUsername(url);
        if (username) {
          lastPageValid = false;
          showStatus('warning', '\u26A0\uFE0F', `${t('statusGoingToFollowing')} (@${username})`);
          return { valid: false, needsRedirect: true, hasUsername: true, username };
        } else {
          lastPageValid = false;
          showStatus('warning', '\u26A0\uFE0F', t('statusGoToProfile'));
          updateStartButton(t('btnGoToProfile'), false);
          return { valid: false, needsRedirect: true, hasUsername: false };
        }
      }

      hideStatus();
      lastPageValid = true;
      updateStartButton(t('btnStart'), false);
      return { valid: true };
    } catch (e) {
      lastPageValid = false;
      showStatus('error', '\u274C', t('statusPageError'));
      return { valid: false };
    }
  }

  function extractUsername(url) {
    try {
      const urlObj = new URL(url);
      const match = urlObj.pathname.match(/^\/([a-zA-Z0-9_]+)/);
      if (match) {
        const username = match[1];
        const reserved = ['home', 'explore', 'notifications', 'messages', 'settings', 'i', 'search', 'compose'];
        if (!reserved.includes(username.toLowerCase())) {
          return username;
        }
      }
    } catch (e) { }
    return null;
  }

  async function openFollowingPage(username) {
    const url = username ? `https://x.com/${username}/following` : 'https://x.com/home';
    const tab = await getActiveTab();
    if (!tab) return;
    await chrome.tabs.update(tab.id, { url });
    window.close();
  }

  async function checkRunningState() {
    try {
      const tab = await getActiveTab();
      if (!tab) return;
      const response = await sendMessageWithRetry(tab.id, { action: 'getState' });

      if (response && response.isRunning) {
        if (response.isPaused) {
          showPausedState();
        } else {
          showRunningState();
        }
        updateStats(response.stats);
      }
    } catch (e) {
      const tab = await getActiveTab();
      if (tab) {
        const url = tab.url || '';
        if (url.includes('x.com') || url.includes('twitter.com')) {
          showStatus('warning', '\u26A0\uFE0F', t('statusNotConnected'));
        }
      }
    }
  }

  function showStatus(type, icon, text) {
    statusBadge.className = `status-badge ${type}`;
    statusBadge.classList.remove('hidden');
    statusIcon.textContent = icon;
    statusText.textContent = text;
  }

  function hideStatus() {
    statusBadge.classList.add('hidden');
  }

  function updateStartButton(text, isRunning) {
    if (isRunning) {
      startBtn.classList.add('hidden');
      runningBtns.classList.remove('hidden');
    } else {
      startBtn.classList.remove('hidden');
      runningBtns.classList.add('hidden');
      startBtn.querySelector('span').textContent = text;
    }
  }

  function showRunningState() {
    currentlyPaused = false;
    showStatus('running', '\uD83D\uDD04', t('statusRunning'));
    updateStartButton('', true);
    pauseBtn.querySelector('span').textContent = t('btnPause');
    pauseBtn.className = 'action-btn action-btn-warning';
    const ps = document.getElementById('progressSection');
    const pb = document.getElementById('progressBar');
    if (ps) ps.classList.remove('hidden');
    if (pb) { pb.classList.add('indeterminate'); pb.style.width = '40%'; }
  }

  function showPausedState() {
    currentlyPaused = true;
    showStatus('paused', '\u23F8\uFE0F', t('statusPaused'));
    updateStartButton('', true);
    pauseBtn.querySelector('span').textContent = t('btnResume');
    pauseBtn.className = 'action-btn action-btn-primary';
  }

  function addLogItem(message, type = 'info', save = true) {
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${type}`;
    const timeFormat = (window.i18n.forcedLang || window.i18n.getLanguage()) === 'tr' ? 'tr-TR' : 'en-US';
    logItem.textContent = `[${new Date().toLocaleTimeString(timeFormat)}] ${message}`;
    logArea.insertBefore(logItem, logArea.firstChild);

    while (logArea.children.length > 100) {
      logArea.removeChild(logArea.lastChild);
    }

    if (save) {
      chrome.storage.local.get(['logs'], (data) => {
        const logs = data.logs || [];
        logs.unshift({ message, type, time: Date.now() });
        if (logs.length > 100) logs.pop();
        chrome.storage.local.set({ logs });
      });
    }
  }

  function addLog(message, type = 'info') {
    addLogItem(message, type, true);
  }

  function updateStats(stats) {
    if (stats) {
      unfollowedCount.textContent = stats.unfollowed || 0;
      skippedCount.textContent = stats.skipped || 0;
      scannedCount.textContent = stats.scanned || 0;
      if (followedCount && stats.followed !== undefined) {
        followedCount.textContent = stats.followed || 0;
      }
      chrome.storage.local.set({ stats });
    }
  }

  function getSelectedMode() {
    const selected = document.querySelector('input[name="mode"]:checked');
    return selected ? selected.value : 'non-followers';
  }

  // Review prompt logic
  const REVIEW_URL = 'https://chromewebstore.google.com/detail/cpeaigkbonkmgamcdeoflbalglkffeag/reviews';
  const REVIEW_MIN_COMPLETIONS = 3;
  const REVIEW_COOLDOWN_DAYS = 30;

  async function maybeShowReviewPromptOnRateLimit(unfollowed) {
    if (unfollowed < 10) return;
    const data = await chrome.storage.local.get(['reviewState']);
    const state = data.reviewState || { completions: 0, dismissed: false, lastPrompt: 0 };
    if (state.dismissed) return;
    const daysSinceLastPrompt = (Date.now() - (state.lastPrompt || 0)) / (1000 * 60 * 60 * 24);
    if (state.lastPrompt && daysSinceLastPrompt < REVIEW_COOLDOWN_DAYS) return;
    reviewPrompt.classList.remove('hidden');
    applyTranslations();
  }

  async function maybeShowReviewPrompt() {
    const data = await chrome.storage.local.get(['reviewState']);
    const state = data.reviewState || { completions: 0, dismissed: false, lastPrompt: 0 };

    state.completions = (state.completions || 0) + 1;
    await chrome.storage.local.set({ reviewState: state });

    if (state.dismissed) return;
    if (state.completions < REVIEW_MIN_COMPLETIONS) return;

    const daysSinceLastPrompt = (Date.now() - (state.lastPrompt || 0)) / (1000 * 60 * 60 * 24);
    if (state.lastPrompt && daysSinceLastPrompt < REVIEW_COOLDOWN_DAYS) return;

    reviewPrompt.classList.remove('hidden');
    applyTranslations();
  }

  reviewYes.addEventListener('click', async () => {
    chrome.tabs.create({ url: REVIEW_URL });
    reviewPrompt.classList.add('hidden');
    await chrome.storage.local.set({ reviewState: { dismissed: true, completions: 0, lastPrompt: Date.now() } });
  });

  reviewLater.addEventListener('click', async () => {
    reviewPrompt.classList.add('hidden');
    const data = await chrome.storage.local.get(['reviewState']);
    const state = data.reviewState || {};
    state.lastPrompt = Date.now();
    await chrome.storage.local.set({ reviewState: state });
  });

  reviewNo.addEventListener('click', async () => {
    reviewPrompt.classList.add('hidden');
    const data = await chrome.storage.local.get(['reviewState']);
    const state = data.reviewState || {};
    state.dismissed = true;
    await chrome.storage.local.set({ reviewState: state });
  });

  // Badge update helper
  function updateBadge(count) {
    if (chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
      chrome.action.setBadgeBackgroundColor({ color: '#1d9bf0' });
    }
  }

  // History management
  function addToHistory(username) {
    chrome.storage.local.get(['history'], (data) => {
      const history = data.history || [];
      history.unshift({ username, time: Date.now() });
      if (history.length > 500) history.pop();
      chrome.storage.local.set({ history });
      renderHistory(history);
    });
  }

  function renderHistory(history) {
    if (!historyArea) return;
    historyArea.innerHTML = '';
    if (!history || history.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.textContent = t('historyEmpty');
      historyArea.appendChild(empty);
      return;
    }
    const timeFormat = (window.i18n.forcedLang || window.i18n.getLanguage()) === 'tr' ? 'tr-TR' : 'en-US';
    history.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item' + (item.refollowed ? ' history-refollowed' : '');
      const userSpan = document.createElement('span');
      userSpan.className = 'history-user';
      userSpan.textContent = `@${item.username}`;
      const rightDiv = document.createElement('div');
      rightDiv.className = 'history-right';
      const timeSpan = document.createElement('span');
      timeSpan.className = 'history-time';
      timeSpan.textContent = new Date(item.time).toLocaleString(timeFormat);
      rightDiv.appendChild(timeSpan);
      if (item.refollowed) {
        const badge = document.createElement('span');
        badge.className = 'refollowed-badge';
        badge.textContent = t('refollowedLabel');
        rightDiv.appendChild(badge);
      } else {
        const refollowBtn = document.createElement('button');
        refollowBtn.className = 'refollow-btn';
        refollowBtn.textContent = '\u21A9\uFE0F';
        refollowBtn.title = t('refollowTitle');
        refollowBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          refollowBtn.disabled = true;
          refollowBtn.textContent = '...';
          try {
            const tab = await getActiveTab();
            if (!tab) return;
            await chrome.tabs.sendMessage(tab.id, {
              action: 'refollow',
              username: item.username
            });
            const data = await chrome.storage.local.get(['history']);
            const hist = data.history || [];
            const entry = hist.find(h => h.username === item.username && h.time === item.time && !h.refollowed);
            if (entry) {
              entry.refollowed = true;
              await chrome.storage.local.set({ history: hist });
              renderHistory(hist);
            }
          } catch (err) {
            refollowBtn.textContent = '\u21A9\uFE0F';
            refollowBtn.disabled = false;
            addLog(t('refollowError', { username: item.username }), 'error');
          }
        });
        rightDiv.appendChild(refollowBtn);
      }
      el.appendChild(userSpan);
      el.appendChild(rightDiv);
      historyArea.appendChild(el);
    });
  }

  // Export/Import
  exportBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(['whitelist', 'mode', 'speed', 'limit', 'history', 'logs']);
    exportImportArea.value = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(exportImportArea.value);
      exportImportStatus.textContent = t('exportSuccess');
      exportImportStatus.className = 'hint hint-success';
    } catch (e) {
      exportImportStatus.textContent = '';
    }
  });

  importBtn.addEventListener('click', () => {
    try {
      const data = JSON.parse(exportImportArea.value);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('Invalid format');
      }
      const allowedKeys = ['whitelist', 'mode', 'speed', 'limit', 'history', 'logs'];
      const validators = {
        whitelist: v => typeof v === 'string',
        mode: v => typeof v === 'string' && ['non-followers', 'all', 'inactive', 'overactive', 'bio-filter', 'follow-all'].includes(v),
        speed: v => typeof v === 'string' && ['0.5', '1', '2'].includes(v),
        limit: v => typeof v === 'number' && v >= 0,
        history: v => Array.isArray(v),
        logs: v => Array.isArray(v)
      };
      const filtered = {};
      allowedKeys.forEach(key => {
        if (data[key] !== undefined && validators[key](data[key])) {
          filtered[key] = data[key];
        }
      });
      if (Object.keys(filtered).length === 0) {
        throw new Error('No valid data');
      }
      chrome.storage.local.set(filtered, () => {
        exportImportStatus.textContent = t('importSuccess');
        exportImportStatus.className = 'hint hint-success';
        if (filtered.whitelist) whitelist.value = filtered.whitelist;
        if (filtered.mode) {
          const radio = document.querySelector(`input[name="mode"][value="${CSS.escape(filtered.mode)}"]`);
          if (radio) radio.checked = true;
        }
        if (filtered.speed) speedSelect.value = filtered.speed;
        if (filtered.limit) limitInput.value = filtered.limit;
        if (filtered.history) renderHistory(filtered.history);
        if (filtered.logs) {
          logArea.innerHTML = '';
          filtered.logs.forEach(log => addLogItem(log.message, log.type, false));
        }
      });
    } catch (e) {
      exportImportStatus.textContent = t('importError');
      exportImportStatus.className = 'hint hint-error';
    }
  });

  // CSV Export
  exportCsvBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(['history']);
    const history = data.history || [];
    if (history.length === 0) {
      exportImportStatus.textContent = t('historyEmpty');
      exportImportStatus.className = 'hint hint-error';
      return;
    }
    const BOM = '\uFEFF';
    const header = 'Username,Date,Time';
    const rows = history.map(item => {
      const d = new Date(item.time);
      const date = d.toLocaleDateString('en-CA');
      const time = d.toLocaleTimeString('en-GB');
      return `@${item.username},${date},${time}`;
    });
    const csv = BOM + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toLocaleDateString('en-CA');
    a.href = url;
    a.download = `xunfollow_history_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    exportImportStatus.textContent = t('exportCsvSuccess');
    exportImportStatus.className = 'hint hint-success';
  });

  // Preview button
  if (previewBtn) {
    previewBtn.addEventListener('click', async () => {
      const tab = await getActiveTab();
      if (!tab) return;
      const previewList = document.getElementById('previewList');
      const previewTitle = document.getElementById('previewTitle');
      if (previewList) previewList.innerHTML = '<div class="preview-item" style="color:var(--text-secondary)">Scanning...</div>';
      if (previewTitle) previewTitle.textContent = 'Preview';
      if (previewModal) previewModal.classList.remove('hidden');
      const mode = getSelectedMode();
      const whitelistUsers = whitelist.value
        .split('\n').map(u => u.trim().toLowerCase().replace('@', '')).filter(u => u.length > 0 && USERNAME_REGEX.test(u));
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'preview', mode, whitelist: whitelistUsers,
          lang: window.i18n.forcedLang || window.i18n.getLanguage()
        });
      } catch (e) {
        if (previewModal) previewModal.classList.add('hidden');
        addLog('Preview failed: ' + e.message, 'error');
      }
    });
  }
  if (previewCancel) {
    previewCancel.addEventListener('click', () => { if (previewModal) previewModal.classList.add('hidden'); });
  }
  if (previewConfirm) {
    previewConfirm.addEventListener('click', () => {
      if (previewModal) previewModal.classList.add('hidden');
      startBtn.click();
    });
  }

  // Start button
  startBtn.addEventListener('click', async () => {
    const targetUser = targetInput.value.trim().replace('@', '');
    if (targetUser) {
      const tab = await getActiveTab();
      if (!tab) return;
      const url = tab.url || '';
      const expectedPath = `/${targetUser}/following`;
      if (!url.includes(expectedPath)) {
        addLog(t('logGoingToFollowing', { username: targetUser }), 'info');
        await openFollowingPage(targetUser);
        return;
      }
    }

    const pageStatus = await checkPage();

    if (!targetUser && pageStatus.needsRedirect) {
      if (pageStatus.hasUsername) {
        addLog(t('logGoingToFollowing', { username: pageStatus.username }), 'info');
        await openFollowingPage(pageStatus.username);
      } else {
        addLog(t('logGoingToHome'), 'info');
        await openFollowingPage(null);
      }
      return;
    }

    if (!targetUser && !pageStatus.valid) return;

    const mode = getSelectedMode();
    const whitelistUsers = whitelist.value
      .split('\n')
      .map(u => u.trim().toLowerCase().replace('@', ''))
      .filter(u => u.length > 0 && USERNAME_REGEX.test(u));

    const speed = parseFloat(speedSelect.value) || 1;
    const limit = parseInt(limitInput.value) || 0;

    try {
      const tab = await getActiveTab();
      if (!tab) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: 'start',
        mode: mode,
        whitelist: whitelistUsers,
        speed: speed,
        limit: limit,
        lang: window.i18n.forcedLang || window.i18n.getLanguage(),
        inactiveDays: parseInt(inactiveDaysSelect.value) || 90,
        minFollowers: parseInt(minFollowersInput.value) || 0,
        bioKeywords: bioKeywordsInput.value.split(',').map(k => k.trim().replace(/[<>"'&]/g, '')).filter(Boolean),
        bioAction: bioActionSelect.value,
        dryRun: demoModeCheck.checked,
        skipVerified: skipVerifiedCheck.checked,
        overactiveThreshold: parseInt(overactiveThresholdInput.value) || 50,
        timerMinutes: parseInt(timerInput.value) || 0,
        notifSound: notifSoundCheck.checked
      });

      showRunningState();
      addLog(t('logStarted'), 'success');

      const modeLogMap = {
        'non-followers': 'logModeNonFollowers',
        'all': 'logModeAll',
        'inactive': 'logModeInactive',
        'overactive': 'logModeOveractive',
        'bio-filter': 'logModeBioFilter',
        'follow-all': 'logModeFollowAll'
      };
      addLog(t(modeLogMap[mode] || 'logModeAll'), 'info');
      addLog(t('logWhitelist', { count: whitelistUsers.length }), 'info');

    } catch (e) {
      showStatus('error', '\u274C', t('statusStartError'));
      addLog(t('logError', { message: e.message }), 'error');
    }
  });

  // Pause/Resume button
  pauseBtn.addEventListener('click', async () => {
    try {
      const tab = await getActiveTab();
      if (!tab) return;
      if (currentlyPaused) {
        await chrome.tabs.sendMessage(tab.id, { action: 'resume' });
        showRunningState();
      } else {
        await chrome.tabs.sendMessage(tab.id, { action: 'pause' });
        showPausedState();
      }
    } catch (e) {
      addLog(t('logError', { message: e.message }), 'error');
    }
  });

  // Stop button
  stopBtn.addEventListener('click', async () => {
    try {
      const tab = await getActiveTab();
      if (!tab) return;
      await chrome.tabs.sendMessage(tab.id, { action: 'stop' });

      showStatus('warning', '\u23F9\uFE0F', t('statusStopped'));
      updateStartButton(t('btnStart'), false);
      addLog(t('logStopped'), 'warning');
      currentlyPaused = false;
      updateBadge(0);

    } catch (e) {
      addLog(t('logStopError', { message: e.message }), 'error');
    }
  });

  // Stats Dashboard
  async function loadStatsDashboard() {
    const data = await chrome.storage.local.get(['cumulativeStats']);
    const cs = data.cumulativeStats || { totalUnfollowed: 0, totalScanned: 0, totalSessions: 0, weeklyUnfollowed: 0, weekStart: 0 };

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (!cs.weekStart || (now - cs.weekStart) > weekMs) {
      cs.weeklyUnfollowed = 0;
      cs.weekStart = now;
    }

    dashAllTime.textContent = cs.totalUnfollowed || 0;
    dashThisWeek.textContent = cs.weeklyUnfollowed || 0;
    dashSessions.textContent = cs.totalSessions || 0;
    const rate = cs.totalScanned > 0 ? Math.round((cs.totalUnfollowed / cs.totalScanned) * 100) : 0;
    dashNonFollowerRate.textContent = `${rate}%`;
  }

  async function updateCumulativeStats(sessionStats) {
    const data = await chrome.storage.local.get(['cumulativeStats']);
    const cs = data.cumulativeStats || { totalUnfollowed: 0, totalScanned: 0, totalSessions: 0, weeklyUnfollowed: 0, weekStart: 0 };

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (!cs.weekStart || (now - cs.weekStart) > weekMs) {
      cs.weeklyUnfollowed = 0;
      cs.weekStart = now;
    }

    cs.totalUnfollowed += sessionStats.unfollowed || 0;
    cs.totalScanned += sessionStats.scanned || 0;
    cs.totalSessions += 1;
    cs.weeklyUnfollowed += sessionStats.unfollowed || 0;

    await chrome.storage.local.set({ cumulativeStats: cs });
    loadStatsDashboard();
  }

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'log') {
      addLog(message.text, message.logType || 'info');
    }
    if (message.type === 'unfollowed') {
      addToHistory(message.username);
    }
    if (message.type === 'stats') {
      updateStats(message.stats);
    }
    if (message.type === 'stopped') {
      showStatus('success', '\u2705', t('statusCompleted'));
      updateStartButton(t('btnStart'), false);
      addLog(t('logCompleted'), 'success');
      currentlyPaused = false;
      updateBadge(0);
      const ps = document.getElementById('progressSection');
      if (ps) ps.classList.add('hidden');
      const pb = document.getElementById('progressBar');
      if (pb) { pb.style.width = '0%'; pb.classList.remove('indeterminate'); }
      const currentStats = {
        unfollowed: parseInt(unfollowedCount.textContent) || 0,
        scanned: parseInt(scannedCount.textContent) || 0
      };
      updateCumulativeStats(currentStats);
      maybeShowReviewPrompt();
    }
    if (message.type === 'progress') {
      const progressSection = document.getElementById('progressSection');
      const progressBar = document.getElementById('progressBar');
      const progressEta = document.getElementById('progressEta');
      if (progressSection) progressSection.classList.remove('hidden');
      if (progressBar && progressEta) {
        if (message.total > 0) {
          const pct = Math.min(100, Math.round((message.unfollowed / message.total) * 100));
          progressBar.classList.remove('indeterminate');
          progressBar.style.width = pct + '%';
          const rate = message.elapsed > 0 ? message.unfollowed / (message.elapsed / 1000) : 0;
          if (rate > 0) {
            const etaSec = Math.round((message.total - message.unfollowed) / rate);
            const etaMin = Math.floor(etaSec / 60);
            const etaSecRem = etaSec % 60;
            progressEta.textContent = `${pct}% — ~${etaMin}m ${etaSecRem}s remaining`;
          } else {
            progressEta.textContent = `${pct}%`;
          }
        } else {
          progressBar.classList.add('indeterminate');
          progressBar.style.width = '40%';
          progressEta.textContent = `${message.unfollowed} unfollowed`;
        }
      }
    }
    if (message.type === 'previewResult') {
      const previewList = document.getElementById('previewList');
      const previewTitle = document.getElementById('previewTitle');
      const users = message.users || [];
      if (previewTitle) {
        const suffix = message.estimated ? '~' : '';
        previewTitle.textContent = `Preview (${suffix}${users.length} users)`;
      }
      if (previewList) {
        if (users.length === 0) {
          previewList.innerHTML = '<div class="preview-item">No users would be unfollowed</div>';
        } else {
          previewList.innerHTML = users.map(u => `<div class="preview-item">@${u}</div>`).join('');
        }
      }
    }
    if (message.type === 'error') {
      showStatus('error', '\u274C', message.text);
      addLog(message.text, 'error');
      updateStartButton(t('btnStart'), false);
      currentlyPaused = false;
    }
    if (message.type === 'cooldownState') {
      const dot = document.getElementById('cooldownDot');
      if (dot) {
        dot.className = 'cooldown-dot cooldown-' + (message.state || 'normal');
        dot.title = t(message.state === 'rateLimit' ? 'cooldownRateLimit' : message.state === 'cooldown' ? 'cooldownSoft' : 'cooldownNormal');
      }
    }
    if (message.type === 'rateLimitPrompt') {
      maybeShowReviewPromptOnRateLimit(message.unfollowed);
    }
    if (message.type === 'badgeUpdate') {
      updateBadge(message.count);
    }
  });

  // Onboarding
  const onboardingOverlay = document.getElementById('onboardingOverlay');
  const onboardingDoneBtn = document.getElementById('onboardingDoneBtn');
  const onboardingData = await chrome.storage.local.get(['onboardingDone']);
  if (!onboardingData.onboardingDone && onboardingOverlay) {
    onboardingOverlay.classList.remove('hidden');
    applyTranslations();
    // Focus trap: keep focus inside onboarding dialog
    if (onboardingDoneBtn) onboardingDoneBtn.focus();
    onboardingOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onboardingDoneBtn.focus();
      }
      if (e.key === 'Escape') {
        onboardingOverlay.classList.add('hidden');
        chrome.storage.local.set({ onboardingDone: true });
      }
    });
  }
  if (onboardingDoneBtn) {
    onboardingDoneBtn.addEventListener('click', () => {
      onboardingOverlay.classList.add('hidden');
      chrome.storage.local.set({ onboardingDone: true });
    });
  }

  // ===== v3.1 VIEW SYSTEM =====
  const RING_CIRC = 326.73;
  let rlCountdownInterval = null;

  const MODE_META = {
    'non-followers': { icon: '👥', nameKey: 'modeNonFollowers', descKey: 'modeNonFollowersDesc' },
    'inactive':      { icon: '⏰', nameKey: 'modeInactive',      descKey: 'modeInactiveDesc' },
    'bio-filter':    { icon: '🌱', nameKey: 'modeBioFilter',      descKey: 'modeBioFilterDesc' },
    'overactive':    { icon: '⚡', nameKey: 'modeOveractive',     descKey: 'modeOveractiveDesc' },
    'all':           { icon: '👤', nameKey: 'modeAll',            descKey: 'modeAllDesc' },
    'follow-all':    { icon: '➕', nameKey: 'modeFollowAll',      descKey: 'modeFollowAllDesc' }
  };

  function setView(viewId) {
    ['idleView', 'runningView', 'rateLimitView', 'sessionCompleteView'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', id !== viewId);
    });
  }

  function updateRingProgress(current, total) {
    const ring = document.getElementById('ringProgress');
    if (!ring) return;
    const pct = total > 0 ? Math.min(current / total, 1) : 0;
    ring.style.strokeDashoffset = RING_CIRC * (1 - pct);
    const rc = document.getElementById('ringUnfollowed');
    if (rc) rc.textContent = current;
  }

  function updateModeCard(mode) {
    const meta = MODE_META[mode] || MODE_META['non-followers'];
    const icon = document.getElementById('modeCardIcon');
    const name = document.getElementById('modeCardName');
    const desc = document.getElementById('modeCardDesc');
    if (icon) icon.textContent = meta.icon;
    if (name) name.textContent = t(meta.nameKey) || meta.nameKey;
    if (desc) desc.textContent = t(meta.descKey) || meta.descKey;
    // Sync panel selection
    document.querySelectorAll('.mode-list-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.modevalue === mode);
    });
    // Sync hidden radios
    const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
    if (radio) radio.checked = true;
  }

  // Mode change button → open panel
  const modeChangeBtn = document.getElementById('modeChangeBtn');
  const modeSelectorPanel = document.getElementById('modeSelectorPanel');
  const modeSelectorDone = document.getElementById('modeSelectorDone');
  const modePanelStart = document.getElementById('modePanelStart');

  if (modeChangeBtn) {
    modeChangeBtn.addEventListener('click', () => {
      if (modeSelectorPanel) {
        modeSelectorPanel.classList.remove('hidden');
        modeSelectorPanel.removeAttribute('aria-hidden');
      }
    });
  }

  if (modeSelectorDone) {
    modeSelectorDone.addEventListener('click', () => {
      if (modeSelectorPanel) {
        modeSelectorPanel.classList.add('hidden');
        modeSelectorPanel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Mode panel item clicks
  document.querySelectorAll('.mode-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.modevalue;
      if (!mode) return;
      updateModeCard(mode);
      chrome.storage.local.set({ mode });
      updateFilterVisibility(mode);
    });
  });

  // Mode panel start button
  if (modePanelStart) {
    modePanelStart.addEventListener('click', () => {
      if (modeSelectorPanel) {
        modeSelectorPanel.classList.add('hidden');
        modeSelectorPanel.setAttribute('aria-hidden', 'true');
      }
      const sb = document.getElementById('startBtn');
      if (sb) sb.click();
    });
  }

  // Secondary quick buttons
  const whitelistQuickBtn = document.getElementById('whitelistQuickBtn');
  const optionsQuickBtn = document.getElementById('optionsQuickBtn');
  if (whitelistQuickBtn) whitelistQuickBtn.addEventListener('click', () => switchTab('tabSettingsContent'));
  if (optionsQuickBtn) optionsQuickBtn.addEventListener('click', () => switchTab('tabSettingsContent'));

  // Rate limit countdown
  function startRateLimitCountdown(seconds) {
    setView('rateLimitView');
    if (rlCountdownInterval) clearInterval(rlCountdownInterval);
    const total = seconds;
    let remaining = seconds;
    const countdown = document.getElementById('rateLimitCountdown');
    const barFill = document.getElementById('rateLimitBarFill');
    function tick() {
      if (countdown) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        countdown.textContent = `${m}:${s.toString().padStart(2, '0')}`;
      }
      if (barFill) barFill.style.width = `${(remaining / total) * 100}%`;
      if (remaining <= 0) { clearInterval(rlCountdownInterval); setView('runningView'); }
      remaining--;
    }
    tick();
    rlCountdownInterval = setInterval(tick, 1000);
  }

  // Session complete
  function showSessionComplete(stats) {
    if (rlCountdownInterval) { clearInterval(rlCountdownInterval); rlCountdownInterval = null; }
    setView('sessionCompleteView');
    const cu = document.getElementById('completeUnfollowed');
    const cs = document.getElementById('completeScanned');
    const ck = document.getElementById('completeSkipped');
    if (cu) cu.textContent = stats.unfollowed || 0;
    if (cs) cs.textContent = stats.scanned || 0;
    if (ck) ck.textContent = stats.skipped || 0;
    const sub = document.getElementById('completeSub');
    if (sub) {
      const meta = MODE_META[getSelectedMode()] || MODE_META['non-followers'];
      sub.textContent = (t(meta.nameKey) || meta.nameKey) + ' Mode';
    }
  }

  // Start New Session button
  const startNewBtn = document.getElementById('startNewBtn');
  if (startNewBtn) {
    startNewBtn.addEventListener('click', () => {
      setView('idleView');
    });
  }

  // Patch showRunningState to also switch view
  const _origShowRunning = showRunningState;
  showRunningState = function() {
    _origShowRunning();
    setView('runningView');
    const meta = MODE_META[getSelectedMode()] || MODE_META['non-followers'];
    const lbl = document.getElementById('ringModeLabel');
    if (lbl) lbl.textContent = (t(meta.nameKey) || meta.nameKey) + ' Mode';
  };

  // Patch showPausedState to keep running view
  const _origShowPaused = showPausedState;
  showPausedState = function() {
    _origShowPaused();
    setView('runningView');
    const lbl = document.getElementById('ringModeLabel');
    if (lbl) lbl.textContent = '⏸ ' + t('statusPaused');
  };

  // Patch updateStats to also update running view elements
  const _origUpdateStats = updateStats;
  updateStats = function(stats) {
    _origUpdateStats(stats);
    if (!stats) return;
    const rs = document.getElementById('runScanned');
    const rsk = document.getElementById('runSkipped');
    if (rs) rs.textContent = stats.scanned || 0;
    if (rsk) rsk.textContent = stats.skipped || 0;
    updateRingProgress(stats.unfollowed || 0, Math.max(stats.scanned || 1, 1));
    // Sync rate limit view stats
    ['rlUnfollowed','rlScanned','rlSkipped'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = [stats.unfollowed, stats.scanned, stats.skipped][i] || 0;
    });
    // Sync idle skipped
    const si = document.getElementById('skippedCountIdle');
    if (si) si.textContent = stats.skipped || 0;
  };

  // Listen for completed / rateLimitStart messages from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'completed') {
      chrome.storage.local.get(['stats'], (d) => showSessionComplete(d.stats || {}));
    }
    if (msg.type === 'rateLimitStart' && msg.seconds) {
      startRateLimitCountdown(msg.seconds);
    }
    if (msg.type === 'cooldownState') {
      const cv = document.getElementById('cooldownValue');
      if (cv && msg.seconds > 0) cv.textContent = msg.seconds + 's';
    }
  });

  // Load dashboard stats for idle view
  chrome.storage.local.get(['cumulativeStats', 'stats'], (d) => {
    const cum = d.cumulativeStats || {};
    const at = document.getElementById('dashAllTime');
    const tw = document.getElementById('dashThisWeek');
    if (at) at.textContent = cum.totalUnfollowed || 0;
    if (tw) tw.textContent = cum.weekUnfollowed || 0;
  });

  // Init mode card from saved storage
  chrome.storage.local.get(['mode'], (d) => {
    updateModeCard(d.mode || 'non-followers');
  });

  // Initial checks
  validateWhitelist();
  await checkPage();
  await checkRunningState();
});
