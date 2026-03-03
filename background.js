// Background Service Worker - X Unfollow Tool

// Keepalive alarm
chrome.alarms.create('keepalive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepalive') { /* SW stays alive */ }
});

// Startup events
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('keepalive', { periodInMinutes: 0.4 });
});

// Keyboard shortcut commands
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const url = tab.url || '';
    if (!url.includes('x.com') && !url.includes('twitter.com')) return;

    if (command === 'toggle-start-stop') {
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
        if (resp?.isRunning) {
          await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
        } else {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggleFromShortcut' });
        }
      } catch (err) {
        console.warn('[SW] Content script not responding:', err.message);
      }
    }

    if (command === 'toggle-pause') {
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
        if (resp?.isRunning) {
          await chrome.tabs.sendMessage(tab.id, { action: resp.isPaused ? 'resume' : 'pause' });
        }
      } catch (err) {
        console.warn('[SW] Content script not responding:', err.message);
      }
    }
  } catch (e) {
    console.error('[SW] Command error:', e);
  }
});

// Listen for notification requests from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'showNotification') {
    chrome.permissions.contains({ permissions: ['notifications'] }, (has) => {
      if (has) {
        chrome.notifications.create('xunfollow-complete', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: message.title || 'X Unfollow Tool',
          message: message.message || 'Process completed!'
        });
      }
    });
  }
  if (message.type === 'ping') { /* SW alive check */ }
});
