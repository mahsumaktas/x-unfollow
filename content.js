// Content Script - X Unfollow Tool
// This script runs on x.com and twitter.com pages

(function () {
    'use strict';

    // === SELECTORS (centralized for easy maintenance) ===
    const SELECTORS = {
        userCell: '[data-testid="UserCell"]',
        followIndicator: '[data-testid="userFollowIndicator"]',
        unfollowButton: '[data-testid$="-unfollow"]',
        confirmButton: '[data-testid="confirmationSheetConfirm"]',
        userLink: 'a[href^="/"]'
    };

    // === DOM DATA EXTRACTION (from UserCell on following/list page) ===
    function extractBioFromCell(userCell) {
        const allDirAuto = userCell.querySelectorAll('div[dir="auto"]');
        for (const div of allDirAuto) {
            if (div.closest('a')) continue;
            const text = div.textContent.trim();
            if (text.length > 0) return text;
        }
        return '';
    }

    function isDefaultAvatarInCell(userCell) {
        const img = userCell.querySelector('img[src]');
        if (!img) return false;
        return (img.src || '').includes('default_profile');
    }

    function isVerifiedInCell(userCell) {
        const svgs = userCell.querySelectorAll('svg');
        for (const svg of svgs) {
            const label = (svg.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('verified') || label.includes('doğrulanmış') || label.includes('認証済み')) return true;
        }
        return false;
    }

    // Inline translations for content script
    const translations = {
        tr: {
            loaded: 'X Unfollow Tool yüklendi!',
            started: 'İşlem başlatıldı...',
            modeNonFollowers: 'Takip Etmeyenler',
            modeAll: 'Herkes',
            modeInactive: 'Pasif Hesaplar',
            mode: 'Mod: {mode}',
            whitelist: 'Whitelist: {count} kullanıcı',
            whitelisted: '@{username} whitelist\'te, atlanıyor',
            followsBack: '@{username} sizi takip ediyor, atlanıyor',
            unfollowed: '@{username} takipten çıkarıldı',
            fetchingProfile: '@{username} profili kontrol ediliyor...',
            inactiveSkip: '@{username} aktif, atlanıyor',
            loading: 'Yeni kullanıcılar yükleniyor...',
            listEnd: 'Liste sonuna ulaşıldı',
            tabHidden: 'Sekme arka planda, bekleniyor...',
            tabActive: 'Sekme tekrar aktif',
            completed: 'İşlem tamamlandı! Çıkarılan: {unfollowed}, Atlanan: {skipped}',
            stopRequest: 'Durdurma isteği alındı...',
            paused: 'İşlem duraklatıldı',
            resumed: 'İşlem devam ediyor',
            limitReached: 'Limite ulaşıldı ({limit} kullanıcı)',
            confirmFailed: '@{username} onay butonu bulunamadı, atlanıyor',
            noUnfollowBtn: '@{username} unfollow butonu bulunamadı, atlanıyor',
            selectorError: 'DOM elementi bulunamadı: {selector}',
            rateLimitDetected: 'Rate limit algılandı! Beklemeye geçiliyor...',
            rateLimitWaiting: 'Rate limit bekleniyor... {minutes} dakika kaldı',
            rateLimitResume: 'Bekleme bitti, işlem devam ediyor',
            bioMatch: '@{username} bio eşleşmesi bulundu',
            bioSkip: '@{username} bio eşleşmedi, atlanıyor',
            bioProtected: '@{username} bio koruması, atlanıyor',
            followed: '@{username} takip edildi',
            followSkip: '@{username} zaten takip ediliyor, atlanıyor',
            followersSkip: '@{username} yeterli takipçiye sahip ({count}), atlanıyor',
            modeBioFilter: 'Bio Filtresi',
            modeFollowAll: 'Tümünü Takip Et',
            demoSkip: '[DEMO] @{username} çıkarılacaktı (simülasyon)',
            demoFollow: '[DEMO] @{username} takip edilecekti (simülasyon)',
            timerExpired: 'Zamanlayıcı doldu, durduruluyor...',
            notifComplete: 'İşlem tamamlandı! Çıkarılan: {unfollowed}, Atlanan: {skipped}',
            verifiedSkip: '@{username} onaylı hesap, atlanıyor',
            modeOveractive: 'Aşırı Aktif',
            overactiveSkip: '@{username} aşırı aktif değil, atlanıyor',
            overactiveMatch: '@{username} aşırı aktif ({rate} tweet/gün)',
            softCooldown: 'Yumuşak bekleme... {seconds}sn',
            refollowed: '@{username} tekrar takip edildi',
            refollowFailed: '@{username} takip edilemedi',
            profileUnavailable: '@{username} profil bilgisi alınamadı, atlanıyor'
        },
        en: {
            loaded: 'X Unfollow Tool loaded!',
            started: 'Process started...',
            modeNonFollowers: 'Non-Followers',
            modeAll: 'Everyone',
            modeInactive: 'Inactive Accounts',
            mode: 'Mode: {mode}',
            whitelist: 'Whitelist: {count} users',
            whitelisted: '@{username} is whitelisted, skipping',
            followsBack: '@{username} follows you, skipping',
            unfollowed: '@{username} unfollowed',
            fetchingProfile: 'Checking @{username} profile...',
            inactiveSkip: '@{username} is active, skipping',
            loading: 'Loading more users...',
            listEnd: 'Reached end of list',
            tabHidden: 'Tab in background, waiting...',
            tabActive: 'Tab active again',
            completed: 'Completed! Unfollowed: {unfollowed}, Skipped: {skipped}',
            stopRequest: 'Stop request received...',
            paused: 'Process paused',
            resumed: 'Process resumed',
            limitReached: 'Limit reached ({limit} users)',
            confirmFailed: '@{username} confirm button not found, skipping',
            noUnfollowBtn: '@{username} unfollow button not found, skipping',
            selectorError: 'DOM element not found: {selector}',
            rateLimitDetected: 'Rate limit detected! Waiting...',
            rateLimitWaiting: 'Rate limit waiting... {minutes} min remaining',
            rateLimitResume: 'Wait complete, resuming process',
            bioMatch: '@{username} bio keyword match found',
            bioSkip: '@{username} bio did not match, skipping',
            bioProtected: '@{username} bio protection, skipping',
            followed: '@{username} followed',
            followSkip: '@{username} already following, skipping',
            followersSkip: '@{username} has enough followers ({count}), skipping',
            modeBioFilter: 'Bio Filter',
            modeFollowAll: 'Follow All',
            demoSkip: '[DEMO] @{username} would be unfollowed (simulation)',
            demoFollow: '[DEMO] @{username} would be followed (simulation)',
            timerExpired: 'Timer expired, stopping...',
            notifComplete: 'Completed! Unfollowed: {unfollowed}, Skipped: {skipped}',
            verifiedSkip: '@{username} is verified, skipping',
            modeOveractive: 'Overactive',
            overactiveSkip: '@{username} is not overactive, skipping',
            overactiveMatch: '@{username} is overactive ({rate} tweets/day)',
            softCooldown: 'Soft cooldown... {seconds}s',
            refollowed: '@{username} refollowed',
            refollowFailed: 'Could not refollow @{username}',
            profileUnavailable: '@{username} profile unavailable, skipping'
        },
        ja: {
            loaded: 'X Unfollow Tool loaded!',
            started: 'プロセスを開始しました...',
            modeNonFollowers: 'フォローバックなし',
            modeAll: '全員',
            modeInactive: '非アクティブ',
            mode: 'モード: {mode}',
            whitelist: 'ホワイトリスト: {count}ユーザー',
            whitelisted: '@{username} はホワイトリスト、スキップ',
            followsBack: '@{username} はフォローバック中、スキップ',
            unfollowed: '@{username} を解除しました',
            fetchingProfile: '@{username} のプロフィールを確認中...',
            inactiveSkip: '@{username} はアクティブ、スキップ',
            loading: 'ユーザーを読み込み中...',
            listEnd: 'リストの終端に到達',
            tabHidden: 'タブが非表示、待機中...',
            tabActive: 'タブが再びアクティブ',
            completed: '完了しました！解除: {unfollowed}、スキップ: {skipped}',
            stopRequest: '停止リクエストを受信...',
            paused: '一時停止しました',
            resumed: '再開しました',
            limitReached: '制限に達しました ({limit}ユーザー)',
            confirmFailed: '@{username} の確認ボタンが見つかりません、スキップ',
            noUnfollowBtn: '@{username} の解除ボタンが見つかりません、スキップ',
            selectorError: 'DOM要素が見つかりません: {selector}',
            rateLimitDetected: 'レート制限を検出しました！待機中...',
            rateLimitWaiting: 'レート制限待機中... 残り{minutes}分',
            rateLimitResume: '待機完了、プロセスを再開します',
            bioMatch: '@{username} バイオキーワード一致',
            bioSkip: '@{username} バイオ不一致、スキップ',
            bioProtected: '@{username} バイオ保護、スキップ',
            followed: '@{username} をフォローしました',
            followSkip: '@{username} はすでにフォロー中、スキップ',
            followersSkip: '@{username} は十分なフォロワーがいます ({count})、スキップ',
            modeBioFilter: 'バイオフィルター',
            modeFollowAll: '全員フォロー',
            demoSkip: '[デモ] @{username} は解除される予定でした（シミュレーション）',
            demoFollow: '[デモ] @{username} はフォローされる予定でした（シミュレーション）',
            timerExpired: 'タイマーが終了しました、停止中...',
            notifComplete: '完了！解除: {unfollowed}、スキップ: {skipped}',
            verifiedSkip: '@{username} は認証済み、スキップ',
            modeOveractive: '過活動',
            overactiveSkip: '@{username} は過活動ではありません、スキップ',
            overactiveMatch: '@{username} は過活動です ({rate} ツイート/日)',
            softCooldown: 'ソフトクールダウン... {seconds}秒',
            refollowed: '@{username} を再フォローしました',
            refollowFailed: '@{username} を再フォローできませんでした',
            profileUnavailable: '@{username} のプロフィールが取得できません、スキップ'
        },
        pt: {
            loaded: 'X Unfollow Tool carregado!',
            started: 'Processo iniciado...',
            modeNonFollowers: 'Não Seguidores',
            modeAll: 'Todos',
            modeInactive: 'Contas Inativas',
            mode: 'Modo: {mode}',
            whitelist: 'Lista branca: {count} usuários',
            whitelisted: '@{username} está na lista branca, pulando',
            followsBack: '@{username} te segue, pulando',
            unfollowed: '@{username} removido',
            fetchingProfile: 'Verificando perfil de @{username}...',
            inactiveSkip: '@{username} está ativo, pulando',
            loading: 'Carregando mais usuários...',
            listEnd: 'Fim da lista',
            tabHidden: 'Aba em segundo plano, aguardando...',
            tabActive: 'Aba ativa novamente',
            completed: 'Concluído! Removidos: {unfollowed}, Pulados: {skipped}',
            stopRequest: 'Pedido de parada recebido...',
            paused: 'Processo pausado',
            resumed: 'Processo retomado',
            limitReached: 'Limite atingido ({limit} usuários)',
            confirmFailed: '@{username} botão de confirmação não encontrado, pulando',
            noUnfollowBtn: '@{username} botão de unfollow não encontrado, pulando',
            selectorError: 'Elemento DOM não encontrado: {selector}',
            rateLimitDetected: 'Rate limit detectado! Aguardando...',
            rateLimitWaiting: 'Aguardando rate limit... {minutes} min restantes',
            rateLimitResume: 'Espera concluída, retomando processo',
            bioMatch: '@{username} correspondência de bio encontrada',
            bioSkip: '@{username} bio não correspondeu, pulando',
            bioProtected: '@{username} proteção de bio, pulando',
            followed: '@{username} seguido',
            followSkip: '@{username} já seguindo, pulando',
            followersSkip: '@{username} tem seguidores suficientes ({count}), pulando',
            modeBioFilter: 'Filtro de Bio',
            modeFollowAll: 'Seguir Todos',
            demoSkip: '[DEMO] @{username} seria removido (simulação)',
            demoFollow: '[DEMO] @{username} seria seguido (simulação)',
            timerExpired: 'Temporizador expirado, parando...',
            notifComplete: 'Concluído! Removidos: {unfollowed}, Pulados: {skipped}',
            verifiedSkip: '@{username} é verificado, pulando',
            modeOveractive: 'Superativo',
            overactiveSkip: '@{username} não é superativo, pulando',
            overactiveMatch: '@{username} é superativo ({rate} tweets/dia)',
            softCooldown: 'Cooldown suave... {seconds}s',
            refollowed: '@{username} seguido novamente',
            refollowFailed: 'Não foi possível reseguir @{username}',
            profileUnavailable: '@{username} perfil indisponível, pulando'
        },
        es: {
            loaded: 'X Unfollow Tool cargado!',
            started: 'Proceso iniciado...',
            modeNonFollowers: 'No Seguidores',
            modeAll: 'Todos',
            modeInactive: 'Cuentas Inactivas',
            mode: 'Modo: {mode}',
            whitelist: 'Lista blanca: {count} usuarios',
            whitelisted: '@{username} está en la lista blanca, omitiendo',
            followsBack: '@{username} te sigue, omitiendo',
            unfollowed: '@{username} eliminado',
            fetchingProfile: 'Revisando perfil de @{username}...',
            inactiveSkip: '@{username} está activo, omitiendo',
            loading: 'Cargando más usuarios...',
            listEnd: 'Fin de la lista',
            tabHidden: 'Pestaña en segundo plano, esperando...',
            tabActive: 'Pestaña activa de nuevo',
            completed: 'Completado. Eliminados: {unfollowed}, Omitidos: {skipped}',
            stopRequest: 'Solicitud de detención recibida...',
            paused: 'Proceso en pausa',
            resumed: 'Proceso reanudado',
            limitReached: 'Límite alcanzado ({limit} usuarios)',
            confirmFailed: 'No se encontró el botón de confirmación de @{username}, omitiendo',
            noUnfollowBtn: 'No se encontró el botón de unfollow de @{username}, omitiendo',
            selectorError: 'Elemento DOM no encontrado: {selector}',
            rateLimitDetected: '¡Rate limit detectado! Esperando...',
            rateLimitWaiting: 'Esperando rate limit... {minutes} min restantes',
            rateLimitResume: 'Espera completada, reanudando proceso',
            bioMatch: '@{username} coincidencia de bio encontrada',
            bioSkip: '@{username} bio no coincide, omitiendo',
            bioProtected: '@{username} protección de bio, omitiendo',
            followed: '@{username} seguido',
            followSkip: '@{username} ya siguiendo, omitiendo',
            followersSkip: '@{username} tiene suficientes seguidores ({count}), omitiendo',
            modeBioFilter: 'Filtro de Bio',
            modeFollowAll: 'Seguir a Todos',
            demoSkip: '[DEMO] @{username} sería eliminado (simulación)',
            demoFollow: '[DEMO] @{username} sería seguido (simulación)',
            timerExpired: 'Temporizador expirado, deteniendo...',
            notifComplete: '¡Completado! Eliminados: {unfollowed}, Omitidos: {skipped}',
            verifiedSkip: '@{username} es verificado, omitiendo',
            modeOveractive: 'Superactivo',
            overactiveSkip: '@{username} no es superactivo, omitiendo',
            overactiveMatch: '@{username} es superactivo ({rate} tweets/día)',
            softCooldown: 'Cooldown suave... {seconds}s',
            refollowed: '@{username} seguido de nuevo',
            refollowFailed: 'No se pudo reseguir a @{username}',
            profileUnavailable: '@{username} perfil no disponible, omitiendo'
        }
    };

    // Forced language override (set by popup via 'start' message)
    let forcedLang = null;

    // Detect language
    function getLanguage() {
        if (forcedLang) return forcedLang;
        const lang = navigator.language || 'en';
        if (lang.startsWith('tr')) return 'tr';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('pt')) return 'pt';
        if (lang.startsWith('es')) return 'es';
        return 'en';
    }

    // Get translation
    function t(key, params = {}) {
        const lang = getLanguage();
        let text = translations[lang][key] || translations.en[key] || key;
        Object.keys(params).forEach(param => {
            text = text.replaceAll(`{${param}}`, params[param]);
        });
        return text;
    }

    // === STATE ===
    let isRunning = false;
    let shouldStop = false;
    let isPaused = false;
    let stats = {
        unfollowed: 0,
        skipped: 0,
        scanned: 0,
        followed: 0
    };
    let currentMode = 'non-followers';
    let whitelist = [];
    let unfollowLimit = 0; // 0 = unlimited
    let speedMultiplier = 1; // 0.5 = fast, 1 = normal, 2 = slow
    let inactiveThresholdDays = 90;
    let bioKeywords = [];
    let bioAction = 'unfollow';
    let minFollowersCount = 0;
    let consecutiveErrors = 0;
    let dryRun = false;
    let skipVerified = false;
    let overactiveThreshold = 50;
    let softCooldownCounter = 0;
    let timerMinutes = 0;
    let timerTimeout = null;
    let notifSound = false;

    // === CONSTANTS ===
    const BASE_DELAY_BETWEEN_ACTIONS = 1500;
    const BASE_DELAY_AFTER_CONFIRM = 1000;
    const BASE_SCROLL_DELAY = 2000;
    const MAX_CONFIRM_RETRIES = 3;
    const CONFIRM_RETRY_DELAY = 500;
    const STATS_SAVE_INTERVAL = 5; // save every N unfollows
    const MAX_LOOP_ITERATIONS = 10000; // absolute safety limit
    const PROFILE_FETCH_DELAY = 2500;
    const PROFILE_FETCH_TIMEOUT = 8000;
    const SOFT_COOLDOWN_INTERVAL = 6;
    const SOFT_COOLDOWN_BASE_DELAY = 10000;

    // Computed delays based on speed
    function getDelay(base) {
        return Math.round(base * speedMultiplier * (0.7 + Math.random() * 0.6));
    }

    // === UTILITIES ===
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseTwitterDate(dateStr) {
        if (!dateStr) return null;
        const parsed = Date.parse(dateStr);
        if (Number.isNaN(parsed)) return null;
        return new Date(parsed);
    }

    function extractJsonObject(text, startIndex) {
        if (startIndex < 0 || startIndex >= text.length || text[startIndex] !== '{') return null;
        let depth = 0;
        let inString = false;
        let escaped = false;

        for (let i = startIndex; i < text.length; i++) {
            const char = text[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (inString) continue;
            if (char === '{') depth++;
            if (char === '}') {
                depth--;
                if (depth === 0) {
                    return text.slice(startIndex, i + 1);
                }
            }
        }
        return null;
    }

    function extractNextDataJson(html) {
        const marker = '<script id="__NEXT_DATA__" type="application/json">';
        const start = html.indexOf(marker);
        if (start === -1) return null;
        const jsonStart = start + marker.length;
        const end = html.indexOf('</script>', jsonStart);
        if (end === -1) return null;
        const jsonText = html.slice(jsonStart, end).trim();
        if (!jsonText) return null;
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            return null;
        }
    }

    function findLegacyInObject(obj, lowerUsername, limit) {
        if (!obj || typeof obj !== 'object' || limit.count <= 0) return null;
        limit.count--;

        if (obj.legacy && typeof obj.legacy.screen_name === 'string') {
            if (obj.legacy.screen_name.toLowerCase() === lowerUsername) {
                return obj.legacy;
            }
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = findLegacyInObject(item, lowerUsername, limit);
                if (found) return found;
            }
            return null;
        }

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                const found = findLegacyInObject(value, lowerUsername, limit);
                if (found) return found;
            }
        }

        return null;
    }

    function extractLegacyFromHtml(html, username) {
        if (!html || !username) return null;
        const lowerHtml = html.toLowerCase();
        const lowerUsername = username.toLowerCase();

        // Fast path: find screen_name, then search BACKWARD for enclosing legacy block.
        const screenNameToken = `"screen_name":"${lowerUsername}"`;
        let index = lowerHtml.indexOf(screenNameToken);
        if (index !== -1) {
            const legacyToken = '"legacy":{';
            const legacyIndex = lowerHtml.lastIndexOf(legacyToken, index);
            if (legacyIndex !== -1) {
                const jsonStart = legacyIndex + legacyToken.length - 1;
                const jsonText = extractJsonObject(html, jsonStart);
                if (jsonText) {
                    try {
                        const parsed = JSON.parse(jsonText);
                        if (typeof parsed.screen_name === 'string' && parsed.screen_name.toLowerCase() === lowerUsername) {
                            return parsed;
                        }
                    } catch (e) {
                        // fall through to slower scan
                    }
                }
            }
        }

        // Fallback: scan all legacy blocks and match screen_name inside.
        // Pick the one with most fields (most complete data).
        const legacyToken = '"legacy":{';
        let cursor = 0;
        let attempts = 0;
        let bestLegacy = null;
        let bestFieldCount = 0;
        while (attempts < 40) {
            const legacyIndex = lowerHtml.indexOf(legacyToken, cursor);
            if (legacyIndex === -1) break;
            const jsonStart = legacyIndex + legacyToken.length - 1;
            const jsonText = extractJsonObject(html, jsonStart);
            if (jsonText) {
                try {
                    const legacy = JSON.parse(jsonText);
                    if (typeof legacy?.screen_name === 'string' && legacy.screen_name.toLowerCase() === lowerUsername) {
                        const fieldCount = Object.keys(legacy).length;
                        if (fieldCount > bestFieldCount) {
                            bestLegacy = legacy;
                            bestFieldCount = fieldCount;
                        }
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
            cursor = legacyIndex + legacyToken.length;
            attempts++;
        }
        if (bestLegacy) return bestLegacy;

        // Fallback 2: __NEXT_DATA__ search
        const nextData = extractNextDataJson(html);
        if (nextData) {
            const found = findLegacyInObject(nextData, lowerUsername, { count: 6000 });
            if (found) return found;
        }

        return null;
    }

    function parseUserData(data) {
        const tweetsCount = typeof data.statuses_count === 'number' ? data.statuses_count : 0;
        const defaultAvatar = !!data.default_profile_image;
        const followersCount = typeof data.followers_count === 'number' ? data.followers_count : null;
        const friendsCount = typeof data.friends_count === 'number' ? data.friends_count : null;
        const createdAt = data.created_at || null;
        const bio = typeof data.description === 'string' ? data.description : '';
        const verified = !!(data.verified || data.is_blue_verified);
        const noBio = !bio || bio.trim().length === 0;
        const defaultProfile = !!data.default_profile;

        let lastTweetDate = null;
        if (data.status) {
            lastTweetDate = parseTwitterDate(data.status.created_at);
            if (!lastTweetDate && data.status.legacy) {
                lastTweetDate = parseTwitterDate(data.status.legacy.created_at);
            }
            if (!lastTweetDate && data.status.result?.legacy) {
                lastTweetDate = parseTwitterDate(data.status.result.legacy.created_at);
            }
        }

        return { tweetsCount, defaultAvatar, defaultProfile, followersCount, friendsCount, createdAt, lastTweetDate, bio, noBio, verified };
    }

    // Bridge communication with MAIN world script (content-bridge.js)
    // Extracts user data from React fiber tree - data X.com already loaded
    async function getUserDataFromBridge(userCell, username) {
        return new Promise((resolve) => {
            const requestId = 'xuf-' + Math.random().toString(36).slice(2);
            const cellAttr = 'data-xuf-id';
            const cellId = 'xuf-cell-' + requestId;
            userCell.setAttribute(cellAttr, cellId);

            const timeout = setTimeout(() => {
                window.removeEventListener('xuf-response', handler);
                userCell.removeAttribute(cellAttr);
                resolve(null);
            }, 3000);

            function handler(e) {
                if (e.detail && e.detail.requestId === requestId) {
                    window.removeEventListener('xuf-response', handler);
                    clearTimeout(timeout);
                    userCell.removeAttribute(cellAttr);
                    resolve(e.detail.data);
                }
            }

            window.addEventListener('xuf-response', handler);

            window.dispatchEvent(new CustomEvent('xuf-request', {
                detail: {
                    requestId: requestId,
                    cellSelector: '[' + cellAttr + '="' + cellId + '"]',
                    username: username
                }
            }));
        });
    }

    // GraphQL bridge communication
    let gqlRateLimitedCount = 0;

    async function fetchUserViaGraphQL(username) {
        return new Promise((resolve) => {
            const requestId = 'xuf-gql-' + Math.random().toString(36).slice(2);

            const timeout = setTimeout(() => {
                window.removeEventListener('xuf-graphql-response', handler);
                resolve(null);
            }, 10000);

            function handler(e) {
                if (e.detail && e.detail.requestId === requestId) {
                    window.removeEventListener('xuf-graphql-response', handler);
                    clearTimeout(timeout);
                    if (e.detail.rateLimited) {
                        resolve({ __rateLimited: true });
                    } else {
                        resolve(e.detail.data);
                    }
                }
            }

            window.addEventListener('xuf-graphql-response', handler);

            window.dispatchEvent(new CustomEvent('xuf-graphql-request', {
                detail: { requestId, username }
            }));
        });
    }

    async function fetchUserProfile(username, userCell) {
        let fiberProfile = null;

        // Try 1: React fiber (fastest, no network, but may lack lastTweetDate)
        if (userCell) {
            try {
                const bridgeData = await getUserDataFromBridge(userCell, username);
                if (bridgeData && bridgeData.screen_name) {
                    fiberProfile = parseUserData(bridgeData);
                    if (fiberProfile && fiberProfile.lastTweetDate) {
                        // Fiber has lastTweetDate - perfect, return immediately
                        log(`Profile @${username} [fiber]: tweets=${fiberProfile.tweetsCount}, lastTweet=${fiberProfile.lastTweetDate.toISOString().split('T')[0]}`, 'info');
                        return fiberProfile;
                    }
                }
            } catch (e) { }
        }

        // Try 2: GraphQL API (has lastTweetDate via UserByScreenName)
        try {
            const gqlData = await fetchUserViaGraphQL(username);
            if (gqlData && gqlData.__rateLimited) {
                gqlRateLimitedCount++;
                if (gqlRateLimitedCount === 1) {
                    log(t('rateLimitDetected'), 'warning');
                    sendCooldownState('rateLimit');
                }
                // Exponential backoff: 3s, 6s, 12s, then cap at 15s
                const backoffDelay = Math.min(3000 * Math.pow(2, gqlRateLimitedCount - 1), 15000);
                await sleep(backoffDelay);
                // Fall through to fiber data
            } else if (gqlData && gqlData.screen_name) {
                if (gqlRateLimitedCount > 0) {
                    gqlRateLimitedCount = 0;
                    log(t('rateLimitResume'), 'success');
                    sendCooldownState('normal');
                }
                const gqlProfile = parseUserData(gqlData);
                if (gqlProfile) {
                    log(`Profile @${username} [graphql]: tweets=${gqlProfile.tweetsCount}, lastTweet=${gqlProfile.lastTweetDate ? gqlProfile.lastTweetDate.toISOString().split('T')[0] : 'none'}`, 'info');
                    return gqlProfile;
                }
            } else {
                // GraphQL returned null (not rate limited, just no data) - reset counter
                if (gqlRateLimitedCount > 0) {
                    gqlRateLimitedCount = 0;
                    sendCooldownState('normal');
                }
            }
        } catch (e) { }

        // Try 3: Return fiber data even without lastTweetDate
        if (fiberProfile) {
            log(`Profile @${username} [fiber]: tweets=${fiberProfile.tweetsCount}, lastTweet=none`, 'info');
            return fiberProfile;
        }

        // Try 4: HTML parsing (last resort)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT);
            const resp = await fetch(`https://x.com/${username}`, {
                credentials: 'include',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                log(`Profile fetch failed (${resp.status}) for @${username}`, 'warning');
                return null;
            }
            const html = await resp.text();
            const legacy = extractLegacyFromHtml(html, username);
            if (legacy) {
                const htmlProfile = parseUserData(legacy);
                if (htmlProfile) {
                    log(`Profile @${username} [html]: tweets=${htmlProfile.tweetsCount}, lastTweet=${htmlProfile.lastTweetDate ? htmlProfile.lastTweetDate.toISOString().split('T')[0] : 'none'}`, 'info');
                    return htmlProfile;
                }
            } else {
                log(`Profile parse failed for @${username}`, 'warning');
            }
        } catch (e) {
            log(`Profile error @${username}: ${e.message}`, 'warning');
        }

        return null;
    }

    // Debounced stat sender
    let statsSendTimer = null;
    function sendStatsDebounced() {
        if (statsSendTimer) clearTimeout(statsSendTimer);
        statsSendTimer = setTimeout(() => {
            chrome.runtime.sendMessage({
                type: 'stats',
                stats: { ...stats }
            }).catch(() => { });
        }, 300);
    }

    function log(message, type = 'info') {
        const emoji = {
            info: '\u{1F4DD}',
            success: '\u2705',
            warning: '\u26A0\uFE0F',
            error: '\u274C'
        };
        console.log(`${emoji[type] || ''} [X Unfollow] ${message}`);

        chrome.runtime.sendMessage({
            type: 'log',
            text: message,
            logType: type
        }).catch(() => { });
    }

    function sendStats() {
        sendStatsDebounced();
    }

    function sendStopped() {
        // Flush pending stats immediately
        if (statsSendTimer) {
            clearTimeout(statsSendTimer);
            statsSendTimer = null;
        }
        chrome.runtime.sendMessage({
            type: 'stats',
            stats: { ...stats }
        }).catch(() => { });
        chrome.runtime.sendMessage({
            type: 'stopped'
        }).catch(() => { });
    }

    function sendError(text) {
        chrome.runtime.sendMessage({
            type: 'error',
            text: text
        }).catch(() => { });
    }

    function sendCooldownState(state) {
        chrome.runtime.sendMessage({
            type: 'cooldownState',
            state: state
        }).catch(() => { });
    }

    // Persist stats to storage periodically for crash recovery
    function persistStats() {
        chrome.storage.local.set({
            stats: { ...stats },
            _lastRunState: {
                isRunning,
                isPaused,
                mode: currentMode,
                timestamp: Date.now()
            }
        }).catch(() => { });
    }

    // Update badge count
    function updateBadge() {
        chrome.runtime.sendMessage({
            type: 'badgeUpdate',
            count: stats.unfollowed
        }).catch(() => { });
    }

    // === BADGE INJECTION ===
    function injectFollowBadge(userCell, followsBack) {
        // Don't inject if already has badge
        if (userCell.querySelector('.xuf-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'xuf-badge';
        badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            padding: 2px 6px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 4px;
            vertical-align: middle;
        `;
        if (followsBack) {
            badge.textContent = '\u2705';
            badge.title = 'Follows you';
            badge.style.background = 'rgba(0, 186, 124, 0.15)';
            badge.style.color = '#00ba7c';
        } else {
            badge.textContent = '\u274C';
            badge.title = 'Does not follow you';
            badge.style.background = 'rgba(244, 33, 46, 0.15)';
            badge.style.color = '#f4212e';
        }
        // Inject after the username link
        const nameContainer = userCell.querySelector('a[href^="/"] span');
        if (nameContainer) {
            nameContainer.parentElement.appendChild(badge);
        }
    }

    // === CORE LOGIC ===

    function isWhitelisted(username) {
        if (!username) return false;
        const cleanUsername = username.toLowerCase().replace('@', '');
        return whitelist.includes(cleanUsername);
    }

    function userFollowsBack(userCell) {
        const followIndicator = userCell.querySelector(SELECTORS.followIndicator);
        return followIndicator !== null;
    }

    const RESERVED_NAMES = new Set([
        'home', 'explore', 'search', 'messages', 'notifications',
        'settings', 'i', 'compose', 'intent', 'tos', 'privacy'
    ]);

    function getUsername(userCell) {
        const link = userCell.querySelector(SELECTORS.userLink);
        if (!link) return null;
        const href = link.getAttribute('href');
        if (!href) return null;
        const username = href.substring(1).split('/')[0];
        // Validate username format
        if (!username || !/^[a-zA-Z0-9_]{1,15}$/.test(username)) return null;
        if (RESERVED_NAMES.has(username.toLowerCase())) return null;
        return username;
    }

    async function clickUnfollow(userCell, username) {
        const unfollowBtn = userCell.querySelector(SELECTORS.unfollowButton);
        if (!unfollowBtn) {
            log(t('noUnfollowBtn', { username: username || '?' }), 'warning');
            return false;
        }
        unfollowBtn.click();
        return true;
    }

    async function clickConfirm(username) {
        // Retry mechanism for confirm button
        for (let attempt = 0; attempt < MAX_CONFIRM_RETRIES; attempt++) {
            await sleep(CONFIRM_RETRY_DELAY);
            const confirmButton = document.querySelector(SELECTORS.confirmButton);
            if (confirmButton) {
                confirmButton.click();
                return true;
            }
        }
        log(t('confirmFailed', { username: username || '?' }), 'warning');
        return false;
    }

    async function processUser(userCell) {
        const username = getUsername(userCell);

        if (!username) {
            return { action: 'skip', reason: 'no-username' };
        }

        if (isWhitelisted(username)) {
            log(t('whitelisted', { username }), 'info');
            return { action: 'skip', reason: 'whitelist' };
        }

        // Inject follow-back badge
        const followsBack = userFollowsBack(userCell);
        injectFollowBadge(userCell, followsBack);

        if (currentMode === 'non-followers') {
            if (followsBack) {
                log(t('followsBack', { username }), 'info');
                return { action: 'skip', reason: 'follows-back' };
            }
        }

        // Follow-all mode: follow instead of unfollow
        if (currentMode === 'follow-all') {
            const unfollowBtn = userCell.querySelector(SELECTORS.unfollowButton);
            // If unfollow button exists, user is already followed
            if (unfollowBtn) {
                log(t('followSkip', { username }), 'info');
                return { action: 'skip', reason: 'already-following' };
            }
            const followBtn = userCell.querySelector('[data-testid$="-follow"]');
            if (!followBtn) {
                log(t('followSkip', { username }), 'info');
                return { action: 'skip', reason: 'no-follow-btn' };
            }
            if (dryRun) {
                log(t('demoFollow', { username }), 'warning');
                await sleep(getDelay(BASE_DELAY_BETWEEN_ACTIONS));
                return { action: 'followed', username };
            }
            followBtn.click();
            await sleep(getDelay(BASE_DELAY_BETWEEN_ACTIONS));
            log(t('followed', { username }), 'success');
            chrome.runtime.sendMessage({
                type: 'followed',
                username: username
            }).catch(() => { });
            return { action: 'followed', username };
        }

        // Bio-filter mode - extract bio from DOM (no profile fetch needed)
        if (currentMode === 'bio-filter') {
            if (skipVerified && isVerifiedInCell(userCell)) {
                log(t('verifiedSkip', { username }), 'info');
                return { action: 'skip', reason: 'verified' };
            }
            const bioText = extractBioFromCell(userCell);
            const bioLower = bioText.toLowerCase();
            const hasKeyword = bioKeywords.length > 0 && bioKeywords.some(kw => bioLower.includes(kw));

            if (bioAction === 'unfollow') {
                if (!hasKeyword) {
                    log(t('bioSkip', { username }), 'info');
                    return { action: 'skip', reason: 'bio-no-match' };
                }
                log(t('bioMatch', { username }), 'info');
            } else {
                if (hasKeyword) {
                    log(t('bioProtected', { username }), 'info');
                    return { action: 'skip', reason: 'bio-protected' };
                }
            }
        }

        // Profile-fetch modes (inactive, overactive) - use React fiber bridge with HTML fallback
        if (currentMode === 'inactive' || currentMode === 'overactive') {
            log(t('fetchingProfile', { username }), 'info');
            const profile = await fetchUserProfile(username, userCell);
            await sleep(getDelay(PROFILE_FETCH_DELAY));

            if (!profile) {
                log(t('profileUnavailable', { username }), 'warning');
                return { action: 'skip', reason: 'profile-unavailable' };
            }

            if (skipVerified && profile.verified) {
                log(t('verifiedSkip', { username }), 'info');
                return { action: 'skip', reason: 'verified' };
            }

            if (minFollowersCount > 0 && profile.followersCount !== null && profile.followersCount >= minFollowersCount) {
                log(t('followersSkip', { username, count: profile.followersCount }), 'info');
                return { action: 'skip', reason: 'enough-followers' };
            }

            if (currentMode === 'inactive') {
                const thresholdMs = inactiveThresholdDays * 24 * 60 * 60 * 1000;
                let isInactive = false;

                // Check 1: Default avatar (ghost) = always inactive
                if (isDefaultAvatarInCell(userCell)) {
                    isInactive = true;
                } else if (profile.lastTweetDate) {
                    // Check 2: Last tweet date vs threshold
                    isInactive = (Date.now() - profile.lastTweetDate.getTime()) >= thresholdMs;
                } else if (profile.tweetsCount === 0) {
                    // Check 3: Zero tweets = definitely inactive
                    isInactive = true;
                } else {
                    // Check 4: No lastTweetDate available
                    // Conservative: only mark inactive if very few tweets on old account
                    const createdDate = parseTwitterDate(profile.createdAt);
                    if (createdDate) {
                        const accountAgeDays = Math.max(1, (Date.now() - createdDate.getTime()) / 86400000);
                        const accountOldEnough = accountAgeDays >= inactiveThresholdDays;
                        if (accountOldEnough && profile.tweetsCount < 20) {
                            isInactive = true;
                        } else {
                            isInactive = false;
                        }
                    } else {
                        isInactive = false;
                    }
                }

                if (!isInactive) {
                    log(t('inactiveSkip', { username }), 'info');
                    return { action: 'skip', reason: 'active' };
                }
            }

            if (currentMode === 'overactive') {
                const createdDate = parseTwitterDate(profile.createdAt);
                if (!createdDate) {
                    return { action: 'skip', reason: 'no-created-date' };
                }
                const daysSinceCreation = Math.max(1, (Date.now() - createdDate.getTime()) / 86400000);
                const dailyRate = Math.round(profile.tweetsCount / daysSinceCreation);
                if (dailyRate < overactiveThreshold) {
                    log(t('overactiveSkip', { username }), 'info');
                    return { action: 'skip', reason: 'not-overactive' };
                }
                log(t('overactiveMatch', { username, rate: dailyRate }), 'info');
            }
        }

        // Skip verified for non-profile-fetch modes (non-followers, all) - use DOM check
        if (skipVerified && (currentMode === 'non-followers' || currentMode === 'all')) {
            if (isVerifiedInCell(userCell)) {
                log(t('verifiedSkip', { username }), 'info');
                return { action: 'skip', reason: 'verified' };
            }
        }

        // Demo mode: simulate unfollow without clicking
        if (dryRun) {
            log(t('demoSkip', { username }), 'warning');
            await sleep(getDelay(BASE_DELAY_BETWEEN_ACTIONS));
            return { action: 'demo-unfollowed', username: username };
        }

        const clicked = await clickUnfollow(userCell, username);
        if (!clicked) {
            return { action: 'skip', reason: 'no-button' };
        }

        await sleep(getDelay(BASE_DELAY_AFTER_CONFIRM));

        const confirmed = await clickConfirm(username);
        if (confirmed) {
            log(t('unfollowed', { username }), 'success');
            // Send dedicated unfollowed message for history tracking
            chrome.runtime.sendMessage({
                type: 'unfollowed',
                username: username
            }).catch(() => { });
            return { action: 'unfollowed', username: username };
        }

        return { action: 'skip', reason: 'confirm-failed' };
    }

    async function scrollDown() {
        const previousHeight = document.documentElement.scrollHeight;
        window.scrollTo(0, document.documentElement.scrollHeight);
        // Ensure minimum 1.5s scroll delay even at fast speed
        const delay = Math.max(getDelay(BASE_SCROLL_DELAY), 1500);
        await sleep(delay);

        const newHeight = document.documentElement.scrollHeight;
        if (newHeight > previousHeight) return true;

        // Retry once with longer wait for slow connections
        await sleep(2000);
        return document.documentElement.scrollHeight > previousHeight;
    }

    // Wait while paused
    async function waitWhilePaused() {
        while (isPaused && isRunning && !shouldStop) {
            await sleep(500);
        }
    }

    // === MAIN LOOP ===
    async function runUnfollowLoop() {
        sendCooldownState('normal');
        softCooldownCounter = 0;
        log(t('started'), 'success');
        let modeName = t('modeAll');
        if (currentMode === 'non-followers') modeName = t('modeNonFollowers');
        if (currentMode === 'inactive') modeName = t('modeInactive');
        if (currentMode === 'overactive') modeName = t('modeOveractive');
        if (currentMode === 'bio-filter') modeName = t('modeBioFilter');
        if (currentMode === 'follow-all') modeName = t('modeFollowAll');
        log(t('mode', { mode: modeName }), 'info');
        log(t('whitelist', { count: whitelist.length }), 'info');

        const processedUsers = new Set();
        let noNewUsersCount = 0;
        const MAX_NO_NEW_USERS = 5;
        let totalIterations = 0;

        while (isRunning && !shouldStop && totalIterations < MAX_LOOP_ITERATIONS) {
            totalIterations++;

            // Check pause state
            if (isPaused) {
                await waitWhilePaused();
                if (shouldStop || !isRunning) break;
            }

            // Check limit
            const actionCount = currentMode === 'follow-all' ? stats.followed : stats.unfollowed;
            if (unfollowLimit > 0 && actionCount >= unfollowLimit) {
                log(t('limitReached', { limit: unfollowLimit }), 'success');
                break;
            }

            // Check if page is visible
            if (document.hidden) {
                log(t('tabHidden'), 'warning');
                await sleep(3000);
                continue;
            }

            const userCells = document.querySelectorAll(SELECTORS.userCell);
            let foundNewUser = false;

            for (const userCell of userCells) {
                if (shouldStop || !isRunning) break;

                // Check pause inside inner loop too
                if (isPaused) {
                    await waitWhilePaused();
                    if (shouldStop || !isRunning) break;
                }

                // Check limit inside inner loop
                const innerActionCount = currentMode === 'follow-all' ? stats.followed : stats.unfollowed;
                if (unfollowLimit > 0 && innerActionCount >= unfollowLimit) break;

                const username = getUsername(userCell);
                if (!username || processedUsers.has(username)) {
                    continue;
                }

                foundNewUser = true;
                processedUsers.add(username);
                stats.scanned++;
                sendStats();

                let result;
                try {
                    result = await processUser(userCell);
                } catch (err) {
                    log(`Error processing @${username}: ${err.message}`, 'error');
                    result = { action: 'skip', reason: 'error' };
                }

                if (result.action === 'unfollowed' || result.action === 'demo-unfollowed') {
                    stats.unfollowed++;
                    consecutiveErrors = 0;
                    if (result.action === 'unfollowed') {
                        softCooldownCounter++;
                    }
                    sendStats();
                    updateBadge();

                    // Periodic crash recovery save
                    if (stats.unfollowed % STATS_SAVE_INTERVAL === 0) {
                        persistStats();
                    }

                    // Soft cooldown every N unfollows (only for real unfollows)
                    if (result.action === 'unfollowed' && softCooldownCounter >= SOFT_COOLDOWN_INTERVAL) {
                        softCooldownCounter = 0;
                        sendCooldownState('cooldown');
                        const cooldownDelay = getDelay(SOFT_COOLDOWN_BASE_DELAY);
                        log(t('softCooldown', { seconds: Math.round(cooldownDelay / 1000) }), 'info');
                        await sleep(cooldownDelay);
                        sendCooldownState('normal');
                    }

                    await sleep(getDelay(BASE_DELAY_BETWEEN_ACTIONS));
                } else if (result.action === 'followed') {
                    stats.followed++;
                    consecutiveErrors = 0;
                    sendStats();

                    if (stats.followed % STATS_SAVE_INTERVAL === 0) {
                        persistStats();
                    }
                } else if (result.action === 'skip') {
                    // Rate limit detection
                    if (result.reason === 'confirm-failed' || result.reason === 'error') {
                        consecutiveErrors++;
                        if (consecutiveErrors >= 3) {
                            sendCooldownState('rateLimit');
                            log(t('rateLimitDetected'), 'error');
                            log(t('rateLimitWaiting', { minutes: 30 }), 'warning');
                            for (let i = 30; i > 0 && isRunning && !shouldStop; i--) {
                                await sleep(60000);
                                if (i % 5 === 0 && i > 0) {
                                    log(t('rateLimitWaiting', { minutes: i }), 'warning');
                                }
                            }
                            log(t('rateLimitResume'), 'success');
                            sendCooldownState('normal');
                            consecutiveErrors = 0;
                        }
                    } else {
                        consecutiveErrors = 0;
                    }
                    stats.skipped++;
                    sendStats();
                }

                await sleep(500);
            }

            if (!foundNewUser) {
                log(t('loading'), 'info');
                const scrolled = await scrollDown();

                if (!scrolled) {
                    noNewUsersCount++;
                    if (noNewUsersCount >= MAX_NO_NEW_USERS) {
                        log(t('listEnd'), 'success');
                        break;
                    }
                } else {
                    noNewUsersCount = 0;
                }
            }
        }

        // Clear timer if set
        if (timerTimeout) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
        }

        // Finish
        isRunning = false;
        shouldStop = false;
        isPaused = false;
        log(t('completed', { unfollowed: stats.unfollowed, skipped: stats.skipped }), 'success');
        persistStats();
        sendStopped();

        // Send notification
        if (notifSound) {
            chrome.runtime.sendMessage({
                type: 'showNotification',
                title: t('notifComplete'),
                message: t('completed', { unfollowed: stats.unfollowed, skipped: stats.skipped })
            }).catch(() => { });
        }
    }

    // === MESSAGE LISTENER ===
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'start') {
            if (isRunning) {
                sendResponse({ success: false, error: 'Already running' });
                return true;
            }

            if (message.lang) forcedLang = message.lang;
            stats = { unfollowed: 0, skipped: 0, scanned: 0, followed: 0 };
            currentMode = message.mode || 'non-followers';
            whitelist = message.whitelist || [];
            unfollowLimit = message.limit || 0;
            speedMultiplier = message.speed || 1;
            inactiveThresholdDays = parseInt(message.inactiveDays, 10) || 90;
            const rawBio = message.bioKeywords || [];
            bioKeywords = (Array.isArray(rawBio) ? rawBio : String(rawBio).split(','))
                .map(k => k.toLowerCase().trim()).filter(Boolean);
            bioAction = message.bioAction || 'unfollow';
            minFollowersCount = parseInt(message.minFollowers, 10) || 0;
            consecutiveErrors = 0;
            dryRun = !!message.dryRun;
            skipVerified = !!message.skipVerified;
            overactiveThreshold = parseInt(message.overactiveThreshold, 10) || 50;
            notifSound = !!message.notifSound;
            timerMinutes = parseInt(message.timerMinutes, 10) || 0;
            isRunning = true;
            shouldStop = false;
            isPaused = false;

            // Auto-stop timer
            if (timerTimeout) clearTimeout(timerTimeout);
            if (timerMinutes > 0) {
                timerTimeout = setTimeout(() => {
                    if (isRunning) {
                        log(t('timerExpired'), 'warning');
                        shouldStop = true;
                    }
                }, timerMinutes * 60 * 1000);
            }

            runUnfollowLoop();
            sendResponse({ success: true });
        }

        if (message.action === 'stop') {
            log(t('stopRequest'), 'warning');
            shouldStop = true;
            isRunning = false;
            isPaused = false;
            sendResponse({ success: true });
        }

        if (message.action === 'pause') {
            isPaused = true;
            log(t('paused'), 'warning');
            sendResponse({ success: true });
        }

        if (message.action === 'resume') {
            isPaused = false;
            log(t('resumed'), 'success');
            sendResponse({ success: true });
        }

        if (message.action === 'getState') {
            sendResponse({
                isRunning: isRunning,
                isPaused: isPaused,
                stats: stats
            });
        }

        if (message.action === 'refollow') {
            const rfUsername = message.username;
            if (rfUsername) {
                const safeUsername = rfUsername.replace(/[^a-zA-Z0-9_]/g, '');
                chrome.storage.local.set({
                    _refollowIntent: {
                        username: safeUsername,
                        returnUrl: window.location.href
                    }
                }, () => {
                    window.location.href = `https://x.com/${safeUsername}`;
                });
            }
            sendResponse({ success: true });
        }

        if (message.action === 'updateSpeed') {
            speedMultiplier = message.speed || 1;
            sendResponse({ success: true });
        }

        if (message.action === 'toggleFromShortcut') {
            if (!isRunning) {
                // Start with default settings from storage
                chrome.storage.local.get(['mode', 'whitelist', 'speed', 'limit', 'inactiveDays', 'minFollowers', 'bioKeywords', 'bioAction', 'demoMode', 'skipVerified', 'timerMinutes', 'notifSound', 'overactiveThreshold'], (saved) => {
                    const whitelistUsers = (saved.whitelist || '').split('\n')
                        .map(u => u.trim().toLowerCase().replace('@', ''))
                        .filter(u => u.length > 0);
                    stats = { unfollowed: 0, skipped: 0, scanned: 0, followed: 0 };
                    currentMode = saved.mode || 'non-followers';
                    whitelist = whitelistUsers;
                    unfollowLimit = parseInt(saved.limit, 10) || 0;
                    speedMultiplier = parseFloat(saved.speed) || 1;
                    inactiveThresholdDays = parseInt(saved.inactiveDays, 10) || 90;
                    const rawBio = saved.bioKeywords || '';
                    bioKeywords = (Array.isArray(rawBio) ? rawBio : String(rawBio).split(','))
                        .map(k => k.toLowerCase().trim()).filter(Boolean);
                    bioAction = saved.bioAction || 'unfollow';
                    minFollowersCount = parseInt(saved.minFollowers, 10) || 0;
                    consecutiveErrors = 0;
                    dryRun = !!saved.demoMode;
                    skipVerified = !!saved.skipVerified;
                    overactiveThreshold = parseInt(saved.overactiveThreshold, 10) || 50;
                    notifSound = !!saved.notifSound;
                    timerMinutes = parseInt(saved.timerMinutes, 10) || 0;
                    isRunning = true;
                    shouldStop = false;
                    isPaused = false;
                    if (timerMinutes > 0) {
                        if (timerTimeout) clearTimeout(timerTimeout);
                        timerTimeout = setTimeout(() => {
                            if (isRunning) {
                                log(t('timerExpired'), 'warning');
                                shouldStop = true;
                            }
                        }, timerMinutes * 60 * 1000);
                    }
                    runUnfollowLoop();
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: true, alreadyRunning: true });
            }
        }

        return true;
    });

    // Visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isRunning) {
            log(t('tabHidden'), 'warning');
        } else if (!document.hidden && isRunning) {
            log(t('tabActive'), 'success');
        }
    });

    // Check for refollow intent
    chrome.storage.local.get(['_refollowIntent'], async (data) => {
        if (data._refollowIntent) {
            const { username, returnUrl } = data._refollowIntent;
            chrome.storage.local.remove('_refollowIntent');
            let followBtn = null;
            for (let i = 0; i < 15; i++) {
                await sleep(1000);
                followBtn = document.querySelector('[data-testid$="-follow"]');
                if (followBtn && !document.querySelector('[data-testid$="-unfollow"]')) break;
                followBtn = null;
            }
            if (followBtn) {
                followBtn.click();
                log(t('refollowed', { username }), 'success');
                await sleep(1000);
            } else {
                log(t('refollowFailed', { username }), 'warning');
            }
            if (returnUrl) {
                window.location.href = returnUrl;
            }
        }
    });

    // Initial log
    console.log(`\u{1F426} ${t('loaded')}`);

})();
