// X Unfollow Tool - Main World Bridge
// Runs in page's MAIN world to access React internals + GraphQL API
// Communicates with content.js via CustomEvent

(function () {
    'use strict';

    // === REACT FIBER EXTRACTION ===

    function findUserLegacy(obj, lowerUsername, seen, depth) {
        if (!obj || typeof obj !== 'object' || depth > 10 || seen.has(obj)) return null;
        seen.add(obj);

        if (typeof obj.screen_name === 'string' &&
            obj.screen_name.toLowerCase() === lowerUsername &&
            typeof obj.statuses_count === 'number') {
            return obj;
        }

        if (obj.legacy && typeof obj.legacy === 'object' &&
            typeof obj.legacy.screen_name === 'string' &&
            obj.legacy.screen_name.toLowerCase() === lowerUsername) {
            return obj.legacy;
        }

        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length && i < 50; i++) {
                var found = findUserLegacy(obj[i], lowerUsername, seen, depth + 1);
                if (found) return found;
            }
            return null;
        }

        for (var key of Object.keys(obj)) {
            if (key.startsWith('_') || key === 'children' || key === 'type' || key === 'ref' || key === 'key') continue;
            try {
                var child = obj[key];
                if (child && typeof child === 'object') {
                    var found = findUserLegacy(child, lowerUsername, seen, depth + 1);
                    if (found) return found;
                }
            } catch (e) { }
        }
        return null;
    }

    function serializeLegacy(legacy) {
        if (!legacy) return null;
        try {
            var result = {
                screen_name: legacy.screen_name || null,
                statuses_count: typeof legacy.statuses_count === 'number' ? legacy.statuses_count : null,
                followers_count: typeof legacy.followers_count === 'number' ? legacy.followers_count : null,
                friends_count: typeof legacy.friends_count === 'number' ? legacy.friends_count : null,
                created_at: legacy.created_at || null,
                description: typeof legacy.description === 'string' ? legacy.description : null,
                default_profile_image: !!legacy.default_profile_image,
                default_profile: !!legacy.default_profile,
                verified: !!legacy.verified,
                is_blue_verified: !!legacy.is_blue_verified,
                status: null
            };
            if (legacy.status) {
                if (legacy.status.created_at) {
                    result.status = { created_at: legacy.status.created_at };
                } else if (legacy.status.legacy && legacy.status.legacy.created_at) {
                    result.status = { created_at: legacy.status.legacy.created_at };
                }
            }
            return result;
        } catch (e) {
            return null;
        }
    }

    // Fiber data request handler
    window.addEventListener('xuf-request', function (e) {
        var detail = e.detail;
        if (!detail || !detail.requestId || !detail.cellSelector || !detail.username) return;

        var requestId = detail.requestId;
        var cell = document.querySelector(detail.cellSelector);
        if (!cell) {
            window.dispatchEvent(new CustomEvent('xuf-response', { detail: { requestId: requestId, data: null } }));
            return;
        }

        var fiberKey = null;
        var cellKeys = Object.keys(cell);
        for (var i = 0; i < cellKeys.length; i++) {
            if (cellKeys[i].startsWith('__reactFiber$') || cellKeys[i].startsWith('__reactInternalInstance$')) {
                fiberKey = cellKeys[i];
                break;
            }
        }

        if (!fiberKey) {
            window.dispatchEvent(new CustomEvent('xuf-response', { detail: { requestId: requestId, data: null } }));
            return;
        }

        var fiber = cell[fiberKey];
        var legacy = null;
        var lowerUsername = detail.username.toLowerCase();

        for (var j = 0; j < 30 && fiber && !legacy; j++) {
            if (fiber.memoizedProps && typeof fiber.memoizedProps === 'object') {
                try {
                    legacy = findUserLegacy(fiber.memoizedProps, lowerUsername, new Set(), 0);
                } catch (ex) { }
            }
            fiber = fiber.return;
        }

        window.dispatchEvent(new CustomEvent('xuf-response', {
            detail: { requestId: requestId, data: serializeLegacy(legacy) }
        }));
    });

    // === GRAPHQL API ===

    // Capture features from X.com's own requests (fetch + XHR interception)
    var capturedFeatures = null;

    function extractFeaturesFromUrl(url) {
        if (typeof url !== 'string' || !url.includes('/i/api/graphql/') || !url.includes('features=')) return;
        try {
            var featuresParam = new URL(url).searchParams.get('features');
            if (featuresParam && featuresParam.length > 100) {
                capturedFeatures = featuresParam;
            }
        } catch (ex) { }
    }

    function extractFeaturesFromBody(body) {
        if (!body || capturedFeatures) return;
        try {
            var parsed = typeof body === 'string' ? JSON.parse(body) : null;
            if (parsed && parsed.features && typeof parsed.features === 'object') {
                var keys = Object.keys(parsed.features);
                if (keys.length > 3) {
                    capturedFeatures = JSON.stringify(parsed.features);
                }
            }
        } catch (ex) { }
    }

    // Intercept fetch (GET url params + POST body)
    var originalFetch = window.fetch;
    window.fetch = function () {
        var url = arguments[0];
        var opts = arguments[1];
        if (!capturedFeatures) {
            var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
            extractFeaturesFromUrl(urlStr);
            if (!capturedFeatures && opts && opts.body && urlStr.includes('/i/api/graphql/')) {
                extractFeaturesFromBody(opts.body);
            }
        }
        return originalFetch.apply(this, arguments);
    };

    // Intercept XMLHttpRequest (URL + send body)
    var originalXhrOpen = XMLHttpRequest.prototype.open;
    var xhrUrlMap = new WeakMap();
    XMLHttpRequest.prototype.open = function () {
        if (arguments.length >= 2) {
            xhrUrlMap.set(this, arguments[1]);
            if (!capturedFeatures) extractFeaturesFromUrl(arguments[1]);
        }
        return originalXhrOpen.apply(this, arguments);
    };
    var originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        if (!capturedFeatures && arguments[0]) {
            var xhrUrl = xhrUrlMap.get(this) || '';
            if (xhrUrl.includes('/i/api/graphql/')) {
                extractFeaturesFromBody(arguments[0]);
            }
        }
        return originalXhrSend.apply(this, arguments);
    };

    // Check performance entries for features from already-completed requests
    function getFeaturesFromPerformance() {
        if (capturedFeatures) return capturedFeatures;
        try {
            var entries = performance.getEntriesByType('resource');
            for (var i = entries.length - 1; i >= 0; i--) {
                var name = entries[i].name;
                if (name.includes('/i/api/graphql/') && name.includes('features=')) {
                    try {
                        var fp = new URL(name).searchParams.get('features');
                        if (fp && fp.length > 100) {
                            capturedFeatures = fp;
                            return fp;
                        }
                    } catch (ex) { }
                }
            }
        } catch (e) { }
        return null;
    }

    var cachedQueryHash = null;
    var cachedFeatureSwitches = null; // Feature names from webpack modules

    // Strategy A: Execute webpack module to get exact query definition
    // Most reliable - gets the actual exported object with queryId + featureSwitches
    function tryExecuteModule(modFn) {
        try {
            var fakeModule = { exports: {} };
            var fakeRequire = function () { return {}; };
            fakeRequire.d = function (exp, defs) {
                for (var key in defs) {
                    if (Object.prototype.hasOwnProperty.call(defs, key) && !Object.prototype.hasOwnProperty.call(exp, key)) {
                        try {
                            Object.defineProperty(exp, key, { enumerable: true, get: defs[key] });
                        } catch (e) { }
                    }
                }
            };
            fakeRequire.r = function (exp) {
                Object.defineProperty(exp, '__esModule', { value: true });
            };
            fakeRequire.n = function (mod) {
                var getter = mod && mod.__esModule ? function () { return mod['default']; } : function () { return mod; };
                return getter;
            };
            fakeRequire.o = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
            fakeRequire.p = '';

            modFn(fakeModule, fakeModule.exports, fakeRequire);

            var exp = fakeModule.exports;
            if (exp && exp.__esModule && exp.default) exp = exp.default;

            if (exp && exp.operationName === 'UserByScreenName' && exp.queryId) {
                cachedQueryHash = exp.queryId;
                if (exp.metadata && Array.isArray(exp.metadata.featureSwitches) && exp.metadata.featureSwitches.length > 0) {
                    cachedFeatureSwitches = exp.metadata.featureSwitches;
                    console.log('[XUF] Module execution OK: hash=' + cachedQueryHash + ', features=' + cachedFeatureSwitches.length);
                }
                return true;
            }
        } catch (e) { }
        return false;
    }

    // Strategy B: Regex extraction from source (fallback)
    function tryExtractQueryInfo(src) {
        if (src.indexOf('UserByScreenName') === -1) return false;

        var match = src.match(/queryId:"([^"]+)"[^}]{0,300}operationName:"UserByScreenName"/)
                 || src.match(/"UserByScreenName"[^}]{0,300}queryId:"([^"]+)"/);
        if (!match) return false;

        cachedQueryHash = match[1];

        // Search FORWARD from match end for featureSwitches (avoid neighboring query)
        var afterPos = match.index + match[0].length;
        var afterChunk = src.substring(afterPos, Math.min(src.length, afterPos + 1500));
        var nextBoundary = afterChunk.search(/operationName:"/);
        if (nextBoundary > 0) afterChunk = afterChunk.substring(0, nextBoundary);

        var fsMatch = afterChunk.match(/featureSwitches:\s*\[([^\]]+)\]/);
        if (fsMatch) {
            var names = [];
            var nameRegex = /"([^"]+)"/g;
            var m;
            while ((m = nameRegex.exec(fsMatch[1])) !== null) {
                names.push(m[1]);
            }
            if (names.length > 2) {
                cachedFeatureSwitches = names;
                console.log('[XUF] Regex extraction: hash=' + cachedQueryHash + ', features=' + names.length);
            }
        }

        return true;
    }

    function discoverQueryHash() {
        if (cachedQueryHash) return Promise.resolve(cachedQueryHash);

        return new Promise(function (resolve) {
            var chunkKeys = Object.keys(window).filter(function (k) { return k.startsWith('webpackChunk'); });

            // Search webpack chunks: try module execution first, then regex
            for (var i = 0; i < chunkKeys.length; i++) {
                var chunks = window[chunkKeys[i]];
                if (!Array.isArray(chunks)) continue;
                for (var j = 0; j < chunks.length; j++) {
                    if (!Array.isArray(chunks[j]) || chunks[j].length < 2) continue;
                    var modules = chunks[j][1];
                    if (typeof modules !== 'object') continue;
                    var moduleIds = Object.keys(modules);
                    for (var k = 0; k < moduleIds.length; k++) {
                        try {
                            var modFn = modules[moduleIds[k]];
                            var src = modFn.toString();
                            if (src.indexOf('UserByScreenName') === -1) continue;

                            // Try A: execute module (most reliable)
                            if (tryExecuteModule(modFn)) {
                                resolve(cachedQueryHash);
                                return;
                            }

                            // Try B: regex extraction (fallback)
                            if (tryExtractQueryInfo(src)) {
                                resolve(cachedQueryHash);
                                return;
                            }
                        } catch (e) { }
                    }
                }
            }

            // Strategy 2: Scan loaded script files (regex only)
            var scripts = document.querySelectorAll('script[src]');
            var urls = [];
            for (var s = 0; s < scripts.length; s++) {
                if (scripts[s].src.includes('.js')) urls.push(scripts[s].src);
            }
            var links = document.querySelectorAll('link[rel="preload"][as="script"]');
            for (var l = 0; l < links.length; l++) {
                if (links[l].href.includes('.js')) urls.push(links[l].href);
            }

            var pending = urls.length;
            if (pending === 0) { resolve(null); return; }

            var found = false;
            urls.forEach(function (url) {
                originalFetch(url).then(function (r) { return r.text(); }).then(function (text) {
                    if (found) return;
                    if (tryExtractQueryInfo(text)) {
                        found = true;
                        resolve(cachedQueryHash);
                    }
                }).catch(function () { }).finally(function () {
                    pending--;
                    if (pending <= 0 && !found) resolve(null);
                });
            });
        });
    }

    // Build features string for UserByScreenName query
    function buildFeaturesString() {
        // Get real feature values from X.com's own requests (for value lookup)
        var realValues = null;
        if (!capturedFeatures) getFeaturesFromPerformance();
        if (capturedFeatures) {
            try { realValues = JSON.parse(capturedFeatures); } catch (e) { }
        }

        // BEST: Use webpack featureSwitches (specific to UserByScreenName)
        // with values from intercepted X.com requests
        if (cachedFeatureSwitches && cachedFeatureSwitches.length > 0) {
            var obj = {};
            for (var i = 0; i < cachedFeatureSwitches.length; i++) {
                var name = cachedFeatureSwitches[i];
                // Use real value from X.com if available, otherwise default to true
                obj[name] = (realValues && name in realValues) ? realValues[name] : true;
            }
            console.log('[XUF] Features: ' + cachedFeatureSwitches.length + ' from webpack' + (realValues ? ' (values from X.com)' : ' (all true)'));
            return JSON.stringify(obj);
        }

        // FALLBACK: intercepted features (from other queries, might not match)
        if (capturedFeatures) {
            console.log('[XUF] Features: intercepted (' + (realValues ? Object.keys(realValues).length : '?') + ') - may not match query');
            return capturedFeatures;
        }

        // LAST RESORT: hardcoded
        console.log('[XUF] Features: hardcoded fallback (4)');
        return JSON.stringify({
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true
        });
    }

    function parseGraphQLResponse(json) {
        if (!json) return null;
        var legacy = null;
        var userResult = null;
        try { userResult = json.data.user.result; } catch (ex) { }
        if (userResult && userResult.legacy) {
            legacy = userResult.legacy;
            if (userResult.is_blue_verified) legacy.is_blue_verified = true;
        }
        return serializeLegacy(legacy);
    }

    var commonHeaders = {
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'content-type': 'application/json'
    };

    // Rate limit tracking
    var graphqlCooldownUntil = 0;
    var graphqlBackoffMs = 10000; // start at 10s

    function respond(requestId, data, rateLimited) {
        window.dispatchEvent(new CustomEvent('xuf-graphql-response', {
            detail: { requestId: requestId, data: data || null, rateLimited: !!rateLimited }
        }));
    }

    // GraphQL user profile request handler
    window.addEventListener('xuf-graphql-request', function (e) {
        var detail = e.detail;
        if (!detail || !detail.requestId || !detail.username) return;

        var requestId = detail.requestId;
        var username = detail.username;

        // If in cooldown, respond immediately with rateLimited
        if (Date.now() < graphqlCooldownUntil) {
            respond(requestId, null, true);
            return;
        }

        discoverQueryHash().then(function (hash) {
            if (!hash) {
                respond(requestId, null, false);
                return;
            }

            var csrfToken = (document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/) || [])[1];
            if (!csrfToken) {
                respond(requestId, null, false);
                return;
            }

            var variablesObj = { screen_name: username, withSafetyModeUserFields: true };
            var fieldTogglesObj = { withAuxiliaryUserLabels: false };
            var featuresStr = buildFeaturesString();
            var headers = Object.assign({}, commonHeaders, { 'x-csrf-token': csrfToken });

            var getUrl = 'https://x.com/i/api/graphql/' + hash + '/UserByScreenName?variables=' +
                encodeURIComponent(JSON.stringify(variablesObj)) + '&features=' + encodeURIComponent(featuresStr) +
                '&fieldToggles=' + encodeURIComponent(JSON.stringify(fieldTogglesObj));

            originalFetch(getUrl, { headers: headers, credentials: 'include' })
            .then(function (resp) {
                if (resp.ok) {
                    // Success - reset backoff
                    graphqlBackoffMs = 10000;
                    return resp.json();
                }

                if (resp.status === 429) {
                    // Rate limited - set cooldown, don't retry
                    graphqlCooldownUntil = Date.now() + graphqlBackoffMs;
                    console.log('[XUF] Rate limited (429). Cooling down for ' + Math.round(graphqlBackoffMs / 1000) + 's');
                    graphqlBackoffMs = Math.min(graphqlBackoffMs * 2, 300000); // max 5 min
                    respond(requestId, null, true);
                    return '__RATE_LIMITED__';
                }

                // Other error (400, etc.) - try POST
                console.log('[XUF] GET failed (' + resp.status + '), trying POST...');
                var featuresObj;
                try { featuresObj = JSON.parse(featuresStr); } catch (e) { featuresObj = {}; }

                return originalFetch('https://x.com/i/api/graphql/' + hash + '/UserByScreenName', {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify({
                        variables: variablesObj,
                        features: featuresObj,
                        fieldToggles: fieldTogglesObj
                    })
                }).then(function (resp2) {
                    if (resp2.status === 429) {
                        graphqlCooldownUntil = Date.now() + graphqlBackoffMs;
                        console.log('[XUF] POST also rate limited (429). Cooling down for ' + Math.round(graphqlBackoffMs / 1000) + 's');
                        graphqlBackoffMs = Math.min(graphqlBackoffMs * 2, 300000);
                        respond(requestId, null, true);
                        return '__RATE_LIMITED__';
                    }
                    return resp2.ok ? resp2.json() : null;
                });
            })
            .then(function (json) {
                if (json === '__RATE_LIMITED__') return; // already responded
                var data = parseGraphQLResponse(json);
                respond(requestId, data, false);
            })
            .catch(function () {
                respond(requestId, null, false);
            });
        });
    });
})();
