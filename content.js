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
            if (label.includes('verified') || label.includes('doğrulanmış') || label.includes('認証済み') || label.includes('verifiziert') || label.includes('vérifié') || label.includes('verificado') || label.includes('موثّق') || label.includes('已认证') || label.includes('인증') || label.includes('terverifikasi') || label.includes('zweryfikowany') || label.includes('verificato') || label.includes('geverifieerd') || label.includes('已驗證') || label.includes('ยืนยันแล้ว')) return true;
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
        },
        zh: {
            loaded: 'X Unfollow 工具已加载！',
            started: '操作已开始...',
            modeNonFollowers: '非互粉用户',
            modeAll: '所有用户',
            modeInactive: '不活跃账号',
            mode: '模式：{mode}',
            whitelist: '白名单：{count} 个用户',
            whitelisted: '@{username} 在白名单中，已跳过',
            followsBack: '@{username} 关注了你，已跳过',
            unfollowed: '已取关 @{username}',
            fetchingProfile: '正在检查 @{username} 的资料...',
            inactiveSkip: '@{username} 仍然活跃，已跳过',
            loading: '正在加载更多用户...',
            listEnd: '已到达列表末尾',
            tabHidden: '标签页在后台，等待中...',
            tabActive: '标签页已重新激活',
            completed: '操作完成！取关：{unfollowed}，跳过：{skipped}',
            stopRequest: '收到停止请求...',
            paused: '操作已暂停',
            resumed: '操作已继续',
            limitReached: '已达到限制（{limit} 个用户）',
            confirmFailed: '未找到 @{username} 的确认按钮，已跳过',
            noUnfollowBtn: '未找到 @{username} 的取关按钮，已跳过',
            selectorError: '未找到 DOM 元素：{selector}',
            rateLimitDetected: '检测到频率限制！正在等待...',
            rateLimitWaiting: '频率限制等待中... 剩余 {minutes} 分钟',
            rateLimitResume: '等待完成，操作继续',
            bioMatch: '在 @{username} 的简介中找到匹配关键词',
            bioSkip: '@{username} 的简介不匹配，已跳过',
            bioProtected: '@{username} 受简介保护，已跳过',
            followed: '已关注 @{username}',
            followSkip: '已关注 @{username}，已跳过',
            followersSkip: '@{username} 已有足够粉丝（{count}），已跳过',
            modeBioFilter: '简介过滤',
            modeFollowAll: '关注所有人',
            demoSkip: '[演示] @{username} 将被取关（模拟）',
            demoFollow: '[演示] @{username} 将被关注（模拟）',
            timerExpired: '计时器已到期，正在停止...',
            notifComplete: '操作完成！取关：{unfollowed}，跳过：{skipped}',
            verifiedSkip: '@{username} 是认证账号，已跳过',
            modeOveractive: '过度活跃',
            overactiveSkip: '@{username} 不属于过度活跃，已跳过',
            overactiveMatch: '@{username} 过度活跃（{rate} 条推文/天）',
            softCooldown: '软冷却中... {seconds} 秒',
            refollowed: '已重新关注 @{username}',
            refollowFailed: '无法重新关注 @{username}',
            profileUnavailable: '无法获取 @{username} 的资料，已跳过'
        },
        de: {
            loaded: 'X Unfollow Tool geladen!',
            started: 'Vorgang gestartet...',
            modeNonFollowers: 'Nicht-Follower',
            modeAll: 'Alle',
            modeInactive: 'Inaktive Konten',
            mode: 'Modus: {mode}',
            whitelist: 'Whitelist: {count} Nutzer',
            whitelisted: '@{username} auf Whitelist, wird übersprungen',
            followsBack: '@{username} folgt dir, wird übersprungen',
            unfollowed: '@{username} entfolgt',
            fetchingProfile: '@{username} Profil wird überprüft...',
            inactiveSkip: '@{username} ist aktiv, wird übersprungen',
            loading: 'Lade weitere Nutzer...',
            listEnd: 'Ende der Liste erreicht',
            tabHidden: 'Tab im Hintergrund, warte...',
            tabActive: 'Tab wieder aktiv',
            completed: 'Fertig! Entfolgt: {unfollowed}, Übersprungen: {skipped}',
            stopRequest: 'Stopp-Anfrage erhalten...',
            paused: 'Vorgang pausiert',
            resumed: 'Vorgang fortgesetzt',
            limitReached: 'Limit erreicht ({limit} Nutzer)',
            confirmFailed: '@{username} Bestätigung nicht gefunden, wird übersprungen',
            noUnfollowBtn: '@{username} Entfolgen-Button nicht gefunden, wird übersprungen',
            selectorError: 'DOM-Element nicht gefunden: {selector}',
            rateLimitDetected: 'Rate-Limit erkannt! Warte...',
            rateLimitWaiting: 'Rate-Limit Wartezeit... {minutes} Min. verbleibend',
            rateLimitResume: 'Wartezeit vorbei, Vorgang wird fortgesetzt',
            bioMatch: '@{username} Bio-Übereinstimmung gefunden',
            bioSkip: '@{username} Bio stimmt nicht überein, wird übersprungen',
            bioProtected: '@{username} Bio-Schutz, wird übersprungen',
            followed: '@{username} gefolgt',
            followSkip: '@{username} wird bereits gefolgt, wird übersprungen',
            followersSkip: '@{username} hat genug Follower ({count}), wird übersprungen',
            modeBioFilter: 'Bio-Filter',
            modeFollowAll: 'Allen folgen',
            demoSkip: '[DEMO] @{username} würde entfolgt (Simulation)',
            demoFollow: '[DEMO] @{username} würde gefolgt (Simulation)',
            timerExpired: 'Timer abgelaufen, wird gestoppt...',
            notifComplete: 'Fertig! Entfolgt: {unfollowed}, Übersprungen: {skipped}',
            verifiedSkip: '@{username} ist verifiziert, wird übersprungen',
            modeOveractive: 'Überaktiv',
            overactiveSkip: '@{username} ist nicht überaktiv, wird übersprungen',
            overactiveMatch: '@{username} ist überaktiv ({rate} Tweets/Tag)',
            softCooldown: 'Sanfte Wartezeit... {seconds}s',
            refollowed: '@{username} erneut gefolgt',
            refollowFailed: 'Konnte @{username} nicht folgen',
            profileUnavailable: '@{username} Profil nicht verfügbar, wird übersprungen'
        },
        fr: {
            loaded: 'X Unfollow Tool chargé !',
            started: 'Processus démarré...',
            modeNonFollowers: 'Non-abonnés',
            modeAll: 'Tous',
            modeInactive: 'Comptes inactifs',
            mode: 'Mode : {mode}',
            whitelist: 'Liste blanche : {count} utilisateurs',
            whitelisted: '@{username} est en liste blanche, ignoré',
            followsBack: '@{username} vous suit, ignoré',
            unfollowed: '@{username} désabonné',
            fetchingProfile: 'Vérification du profil de @{username}...',
            inactiveSkip: '@{username} est actif, ignoré',
            loading: 'Chargement d\'autres utilisateurs...',
            listEnd: 'Fin de la liste atteinte',
            tabHidden: 'Onglet en arrière-plan, en attente...',
            tabActive: 'Onglet de nouveau actif',
            completed: 'Terminé ! Désabonnés : {unfollowed}, Ignorés : {skipped}',
            stopRequest: 'Demande d\'arrêt reçue...',
            paused: 'Processus en pause',
            resumed: 'Processus repris',
            limitReached: 'Limite atteinte ({limit} utilisateurs)',
            confirmFailed: '@{username} bouton de confirmation non trouvé, ignoré',
            noUnfollowBtn: '@{username} bouton désabonner non trouvé, ignoré',
            selectorError: 'Élément DOM non trouvé : {selector}',
            rateLimitDetected: 'Limite de débit détectée ! En attente...',
            rateLimitWaiting: 'Attente limite de débit... {minutes} min restantes',
            rateLimitResume: 'Attente terminée, reprise du processus',
            bioMatch: '@{username} correspondance bio trouvée',
            bioSkip: '@{username} bio ne correspond pas, ignoré',
            bioProtected: '@{username} protection bio, ignoré',
            followed: '@{username} suivi',
            followSkip: '@{username} déjà suivi, ignoré',
            followersSkip: '@{username} a assez d\'abonnés ({count}), ignoré',
            modeBioFilter: 'Filtre bio',
            modeFollowAll: 'Suivre tout le monde',
            demoSkip: '[DÉMO] @{username} serait désabonné (simulation)',
            demoFollow: '[DÉMO] @{username} serait suivi (simulation)',
            timerExpired: 'Minuteur expiré, arrêt...',
            notifComplete: 'Terminé ! Désabonnés : {unfollowed}, Ignorés : {skipped}',
            verifiedSkip: '@{username} est vérifié, ignoré',
            modeOveractive: 'Hyperactif',
            overactiveSkip: '@{username} n\'est pas hyperactif, ignoré',
            overactiveMatch: '@{username} est hyperactif ({rate} tweets/jour)',
            softCooldown: 'Attente douce... {seconds}s',
            refollowed: '@{username} suivi à nouveau',
            refollowFailed: 'Impossible de suivre @{username}',
            profileUnavailable: '@{username} profil indisponible, ignoré'
        },
        ar: {
            loaded: '!X Unfollow Tool تم تحميل',
            started: 'بدأت العملية...',
            modeNonFollowers: 'غير المتابعين',
            modeAll: 'الجميع',
            modeInactive: 'حسابات غير نشطة',
            mode: 'الوضع: {mode}',
            whitelist: 'القائمة البيضاء: {count} مستخدم',
            whitelisted: '@{username} في القائمة البيضاء، تم التخطي',
            followsBack: '@{username} يتابعك، تم التخطي',
            unfollowed: 'تم إلغاء متابعة @{username}',
            fetchingProfile: 'جاري فحص ملف @{username}...',
            inactiveSkip: '@{username} نشط، تم التخطي',
            loading: 'جاري تحميل المزيد من المستخدمين...',
            listEnd: 'تم الوصول لنهاية القائمة',
            tabHidden: 'التبويب في الخلفية، بانتظار...',
            tabActive: 'التبويب نشط مجدداً',
            completed: 'اكتمل! إلغاء المتابعة: {unfollowed}، تم التخطي: {skipped}',
            stopRequest: 'تم استلام طلب الإيقاف...',
            paused: 'العملية متوقفة مؤقتاً',
            resumed: 'تم استئناف العملية',
            limitReached: 'تم الوصول للحد ({limit} مستخدم)',
            confirmFailed: '@{username} لم يتم العثور على زر التأكيد، تم التخطي',
            noUnfollowBtn: '@{username} لم يتم العثور على زر إلغاء المتابعة، تم التخطي',
            selectorError: 'لم يتم العثور على عنصر DOM: {selector}',
            rateLimitDetected: 'تم اكتشاف حد الطلبات! بانتظار...',
            rateLimitWaiting: 'انتظار حد الطلبات... {minutes} دقيقة متبقية',
            rateLimitResume: 'انتهى الانتظار، استئناف العملية',
            bioMatch: '@{username} تم العثور على تطابق في السيرة',
            bioSkip: '@{username} السيرة لا تتطابق، تم التخطي',
            bioProtected: '@{username} حماية السيرة، تم التخطي',
            followed: 'تمت متابعة @{username}',
            followSkip: '@{username} متابع بالفعل، تم التخطي',
            followersSkip: '@{username} لديه متابعون كافون ({count})، تم التخطي',
            modeBioFilter: 'فلتر السيرة',
            modeFollowAll: 'متابعة الجميع',
            demoSkip: '[عرض] @{username} كان سيتم إلغاء متابعته (محاكاة)',
            demoFollow: '[عرض] @{username} كان سيتم متابعته (محاكاة)',
            timerExpired: 'انتهى المؤقت، جاري الإيقاف...',
            notifComplete: 'اكتمل! إلغاء المتابعة: {unfollowed}، تم التخطي: {skipped}',
            verifiedSkip: '@{username} موثق، تم التخطي',
            modeOveractive: 'مفرط النشاط',
            overactiveSkip: '@{username} ليس مفرط النشاط، تم التخطي',
            overactiveMatch: '@{username} مفرط النشاط ({rate} تغريدة/يوم)',
            softCooldown: 'انتظار خفيف... {seconds}ث',
            refollowed: 'تمت إعادة متابعة @{username}',
            refollowFailed: 'تعذرت متابعة @{username}',
            profileUnavailable: '@{username} الملف الشخصي غير متاح، تم التخطي'
        },
        id: {
    loaded: 'X Unfollow Tool berhasil dimuat!',
    started: 'Proses dimulai...',
    modeNonFollowers: 'Tidak Follow Balik',
    modeAll: 'Semua',
    modeInactive: 'Akun Tidak Aktif',
    mode: 'Mode: {mode}',
    whitelist: 'Daftar Putih: {count} pengguna',
    whitelisted: '@{username} ada di daftar putih, dilewati',
    followsBack: '@{username} mem-follow Anda balik, dilewati',
    unfollowed: '@{username} di-unfollow',
    fetchingProfile: 'Memeriksa profil @{username}...',
    inactiveSkip: '@{username} masih aktif, dilewati',
    loading: 'Memuat lebih banyak pengguna...',
    listEnd: 'Sudah sampai akhir daftar',
    tabHidden: 'Tab di latar belakang, menunggu...',
    tabActive: 'Tab aktif kembali',
    completed: 'Selesai! Di-unfollow: {unfollowed}, Dilewati: {skipped}',
    stopRequest: 'Permintaan berhenti diterima...',
    paused: 'Proses dijeda',
    resumed: 'Proses dilanjutkan',
    limitReached: 'Batas tercapai ({limit} pengguna)',
    confirmFailed: 'Tombol konfirmasi @{username} tidak ditemukan, dilewati',
    noUnfollowBtn: 'Tombol unfollow @{username} tidak ditemukan, dilewati',
    selectorError: 'Elemen DOM tidak ditemukan: {selector}',
    rateLimitDetected: 'Batas rate terdeteksi! Menunggu...',
    rateLimitWaiting: 'Menunggu batas rate... {minutes} menit tersisa',
    rateLimitResume: 'Waktu tunggu selesai, melanjutkan proses',
    bioMatch: 'Kata kunci bio @{username} cocok',
    bioSkip: 'Bio @{username} tidak cocok, dilewati',
    bioProtected: '@{username} dilindungi oleh bio, dilewati',
    followed: '@{username} di-follow',
    followSkip: '@{username} sudah di-follow, dilewati',
    followersSkip: '@{username} punya cukup pengikut ({count}), dilewati',
    modeBioFilter: 'Filter Bio',
    modeFollowAll: 'Follow Semua',
    demoSkip: '[DEMO] @{username} akan di-unfollow (simulasi)',
    demoFollow: '[DEMO] @{username} akan di-follow (simulasi)',
    timerExpired: 'Timer habis, menghentikan...',
    notifComplete: 'Selesai! Di-unfollow: {unfollowed}, Dilewati: {skipped}',
    verifiedSkip: '@{username} terverifikasi, dilewati',
    modeOveractive: 'Terlalu Aktif',
    overactiveSkip: '@{username} tidak terlalu aktif, dilewati',
    overactiveMatch: '@{username} terlalu aktif ({rate} tweet/hari)',
    softCooldown: 'Jeda ringan... {seconds}dtk',
    refollowed: '@{username} di-follow kembali',
    refollowFailed: 'Gagal mem-follow kembali @{username}',
    profileUnavailable: 'Profil @{username} tidak tersedia, dilewati',
        },
        ko: {
    loaded: 'X Unfollow Tool이 로드되었습니다!',
    started: '프로세스 시작...',
    modeNonFollowers: '맞팔 안 한 계정',
    modeAll: '전체',
    modeInactive: '비활성 계정',
    mode: '모드: {mode}',
    whitelist: '화이트리스트: {count}명',
    whitelisted: '@{username} 화이트리스트에 있음, 건너뜀',
    followsBack: '@{username} 맞팔 중, 건너뜀',
    unfollowed: '@{username} 언팔로우 완료',
    fetchingProfile: '@{username} 프로필 확인 중...',
    inactiveSkip: '@{username} 활동 중, 건너뜀',
    loading: '사용자 추가 로드 중...',
    listEnd: '목록 끝에 도달',
    tabHidden: '탭이 백그라운드 상태, 대기 중...',
    tabActive: '탭이 다시 활성화됨',
    completed: '완료! 언팔로우: {unfollowed}, 건너뜀: {skipped}',
    stopRequest: '중지 요청 수신...',
    paused: '프로세스 일시정지됨',
    resumed: '프로세스 재개됨',
    limitReached: '제한 도달 ({limit}명)',
    confirmFailed: '@{username} 확인 버튼을 찾을 수 없음, 건너뜀',
    noUnfollowBtn: '@{username} 언팔로우 버튼을 찾을 수 없음, 건너뜀',
    selectorError: 'DOM 요소를 찾을 수 없음: {selector}',
    rateLimitDetected: '요청 제한 감지! 대기 중...',
    rateLimitWaiting: '요청 제한 대기 중... {minutes}분 남음',
    rateLimitResume: '대기 완료, 프로세스 재개',
    bioMatch: '@{username} 바이오 키워드 일치',
    bioSkip: '@{username} 바이오 불일치, 건너뜀',
    bioProtected: '@{username} 바이오 보호 대상, 건너뜀',
    followed: '@{username} 팔로우 완료',
    followSkip: '@{username} 이미 팔로우 중, 건너뜀',
    followersSkip: '@{username} 팔로워 충분 ({count}명), 건너뜀',
    modeBioFilter: '바이오 필터',
    modeFollowAll: '전체 팔로우',
    demoSkip: '[DEMO] @{username} 언팔로우 예정 (시뮬레이션)',
    demoFollow: '[DEMO] @{username} 팔로우 예정 (시뮬레이션)',
    timerExpired: '타이머 만료, 중지 중...',
    notifComplete: '완료! 언팔로우: {unfollowed}, 건너뜀: {skipped}',
    verifiedSkip: '@{username} 인증 계정, 건너뜀',
    modeOveractive: '과다 활동',
    overactiveSkip: '@{username} 과다 활동 아님, 건너뜀',
    overactiveMatch: '@{username} 과다 활동 ({rate} 트윗/일)',
    softCooldown: '가벼운 대기... {seconds}초',
    refollowed: '@{username} 다시 팔로우됨',
    refollowFailed: '@{username}을(를) 다시 팔로우할 수 없음',
    profileUnavailable: '@{username} 프로필을 불러올 수 없음, 건너뜀',
        },
        hi: {
    loaded: 'X Unfollow Tool लोड हो गया!',
    started: 'प्रोसेस शुरू हो गया...',
    modeNonFollowers: 'फॉलो नहीं करने वाले',
    modeAll: 'सभी',
    modeInactive: 'निष्क्रिय अकाउंट',
    mode: 'मोड: {mode}',
    whitelist: 'व्हाइटलिस्ट: {count} यूज़र',
    whitelisted: '@{username} व्हाइटलिस्ट में है, छोड़ रहे हैं',
    followsBack: '@{username} तुम्हें फॉलो करता है, छोड़ रहे हैं',
    unfollowed: '@{username} अनफॉलो कर दिया',
    fetchingProfile: '@{username} की प्रोफ़ाइल चेक हो रही है...',
    inactiveSkip: '@{username} एक्टिव है, छोड़ रहे हैं',
    loading: 'और यूज़र्स लोड हो रहे हैं...',
    listEnd: 'लिस्ट ख़त्म हो गई',
    tabHidden: 'टैब बैकग्राउंड में है, इंतज़ार कर रहे हैं...',
    tabActive: 'टैब फिर एक्टिव हुआ',
    completed: 'पूरा हुआ! अनफॉलो: {unfollowed}, छोड़े: {skipped}',
    stopRequest: 'रोकने की रिक्वेस्ट मिली...',
    paused: 'प्रोसेस रुका हुआ है',
    resumed: 'प्रोसेस फिर शुरू हुआ',
    limitReached: 'लिमिट पूरी हो गई ({limit} यूज़र)',
    confirmFailed: '@{username} का कन्फर्म बटन नहीं मिला, छोड़ रहे हैं',
    noUnfollowBtn: '@{username} का अनफॉलो बटन नहीं मिला, छोड़ रहे हैं',
    selectorError: 'DOM एलिमेंट नहीं मिला: {selector}',
    rateLimitDetected: 'रेट लिमिट लग गई! इंतज़ार कर रहे हैं...',
    rateLimitWaiting: 'रेट लिमिट वेट... {minutes} मिनट बाकी',
    rateLimitResume: 'इंतज़ार ख़त्म, प्रोसेस फिर शुरू',
    bioMatch: '@{username} Bio कीवर्ड मैच हो गया',
    bioSkip: '@{username} Bio मैच नहीं हुआ, छोड़ रहे हैं',
    bioProtected: '@{username} Bio प्रोटेक्शन, छोड़ रहे हैं',
    followed: '@{username} फॉलो कर लिया',
    followSkip: '@{username} पहले से फॉलो है, छोड़ रहे हैं',
    followersSkip: '@{username} के काफ़ी फॉलोअर्स हैं ({count}), छोड़ रहे हैं',
    modeBioFilter: 'Bio फ़िल्टर',
    modeFollowAll: 'सबको फॉलो करो',
    demoSkip: '[DEMO] @{username} अनफॉलो होता (सिम्युलेशन)',
    demoFollow: '[DEMO] @{username} फॉलो होता (सिम्युलेशन)',
    timerExpired: 'टाइमर ख़त्म, रोक रहे हैं...',
    notifComplete: 'पूरा हुआ! अनफॉलो: {unfollowed}, छोड़े: {skipped}',
    verifiedSkip: '@{username} वेरिफ़ाइड है, छोड़ रहे हैं',
    modeOveractive: 'ज़्यादा एक्टिव',
    overactiveSkip: '@{username} ज़्यादा एक्टिव नहीं है, छोड़ रहे हैं',
    overactiveMatch: '@{username} ज़्यादा एक्टिव है ({rate} ट्वीट/दिन)',
    softCooldown: 'हल्का वेट... {seconds} सेकंड',
    refollowed: '@{username} को फिर फॉलो कर लिया',
    refollowFailed: '@{username} को फॉलो नहीं कर पाए',
    profileUnavailable: '@{username} की प्रोफ़ाइल उपलब्ध नहीं, छोड़ रहे हैं'
        },
        th: {
    loaded: 'X Unfollow Tool โหลดแล้ว!',
    started: 'เริ่มกระบวนการแล้ว...',
    modeNonFollowers: 'ไม่ได้ติดตามกลับ',
    modeAll: 'ทุกคน',
    modeInactive: 'บัญชีไม่เคลื่อนไหว',
    mode: 'โหมด: {mode}',
    whitelist: 'รายการยกเว้น: {count} คน',
    whitelisted: '@{username} อยู่ในรายการยกเว้น ข้ามไป',
    followsBack: '@{username} ติดตามคุณอยู่ ข้ามไป',
    unfollowed: 'เลิกติดตาม @{username} แล้ว',
    fetchingProfile: 'กำลังตรวจสอบโปรไฟล์ @{username}...',
    inactiveSkip: '@{username} ยังเคลื่อนไหวอยู่ ข้ามไป',
    loading: 'กำลังโหลดผู้ใช้เพิ่ม...',
    listEnd: 'ถึงท้ายรายการแล้ว',
    tabHidden: 'แท็บอยู่เบื้องหลัง รอก่อน...',
    tabActive: 'แท็บกลับมาทำงานแล้ว',
    completed: 'เสร็จแล้ว! เลิกติดตาม: {unfollowed}, ข้าม: {skipped}',
    stopRequest: 'ได้รับคำขอหยุด...',
    paused: 'กระบวนการหยุดชั่วคราว',
    resumed: 'กระบวนการดำเนินต่อแล้ว',
    limitReached: 'ถึงขีดจำกัดแล้ว ({limit} คน)',
    confirmFailed: 'ไม่พบปุ่มยืนยันของ @{username} ข้ามไป',
    noUnfollowBtn: 'ไม่พบปุ่มเลิกติดตามของ @{username} ข้ามไป',
    selectorError: 'ไม่พบ DOM element: {selector}',
    rateLimitDetected: 'ตรวจพบการจำกัดอัตรา! กำลังรอ...',
    rateLimitWaiting: 'รอการจำกัดอัตรา... เหลือ {minutes} นาที',
    rateLimitResume: 'รอเสร็จแล้ว ดำเนินต่อ',
    bioMatch: 'พบคีย์เวิร์ด Bio ตรงกับ @{username}',
    bioSkip: 'Bio ของ @{username} ไม่ตรง ข้ามไป',
    bioProtected: '@{username} มีการปกป้อง Bio ข้ามไป',
    followed: 'ติดตาม @{username} แล้ว',
    followSkip: 'ติดตาม @{username} อยู่แล้ว ข้ามไป',
    followersSkip: '@{username} มีผู้ติดตามเพียงพอแล้ว ({count}) ข้ามไป',
    modeBioFilter: 'กรอง Bio',
    modeFollowAll: 'ติดตามทั้งหมด',
    demoSkip: '[DEMO] @{username} จะถูกเลิกติดตาม (จำลอง)',
    demoFollow: '[DEMO] @{username} จะถูกติดตาม (จำลอง)',
    timerExpired: 'หมดเวลาแล้ว กำลังหยุด...',
    notifComplete: 'เสร็จแล้ว! เลิกติดตาม: {unfollowed}, ข้าม: {skipped}',
    verifiedSkip: '@{username} ได้รับการยืนยันแล้ว ข้ามไป',
    modeOveractive: 'โพสต์มากเกินไป',
    overactiveSkip: '@{username} ไม่ได้โพสต์มากเกินไป ข้ามไป',
    overactiveMatch: '@{username} โพสต์มากเกินไป ({rate} ทวีต/วัน)',
    softCooldown: 'รอเบาๆ... {seconds} วินาที',
    refollowed: 'ติดตาม @{username} อีกครั้งแล้ว',
    refollowFailed: 'ไม่สามารถติดตาม @{username} อีกครั้งได้',
    profileUnavailable: 'โปรไฟล์ @{username} ไม่พร้อมใช้งาน ข้ามไป'
        },
        pl: {
    loaded: 'X Unfollow Tool zaladowany!',
    started: 'Proces rozpoczety...',
    modeNonFollowers: 'Nieobserwujacy',
    modeAll: 'Wszyscy',
    modeInactive: 'Nieaktywne konta',
    mode: 'Tryb: {mode}',
    whitelist: 'Biala lista: {count} uzytkownikow',
    whitelisted: '@{username} jest na bialej liscie, pomijanie',
    followsBack: '@{username} obserwuje Cie, pomijanie',
    unfollowed: '@{username} usuniety z obserwowanych',
    fetchingProfile: 'Sprawdzanie profilu @{username}...',
    inactiveSkip: '@{username} jest aktywny, pomijanie',
    loading: 'Ladowanie kolejnych uzytkownikow...',
    listEnd: 'Osiagnieto koniec listy',
    tabHidden: 'Karta w tle, oczekiwanie...',
    tabActive: 'Karta ponownie aktywna',
    completed: 'Zakonczone! Usunieto: {unfollowed}, Pominieto: {skipped}',
    stopRequest: 'Otrzymano zadanie zatrzymania...',
    paused: 'Proces wstrzymany',
    resumed: 'Proces wznowiony',
    limitReached: 'Osiagnieto limit ({limit} uzytkownikow)',
    confirmFailed: '@{username} przycisk potwierdzenia nie znaleziony, pomijanie',
    noUnfollowBtn: '@{username} przycisk usuwania nie znaleziony, pomijanie',
    selectorError: 'Element DOM nie znaleziony: {selector}',
    rateLimitDetected: 'Wykryto limit zapytan! Oczekiwanie...',
    rateLimitWaiting: 'Oczekiwanie na limit zapytan... {minutes} min pozostalo',
    rateLimitResume: 'Oczekiwanie zakonczone, wznawianie procesu',
    bioMatch: '@{username} znaleziono dopasowanie w bio',
    bioSkip: '@{username} bio nie pasuje, pomijanie',
    bioProtected: '@{username} ochrona bio, pomijanie',
    followed: '@{username} zaobserwowany',
    followSkip: '@{username} juz obserwowany, pomijanie',
    followersSkip: '@{username} ma wystarczajaco obserwujacych ({count}), pomijanie',
    modeBioFilter: 'Filtr bio',
    modeFollowAll: 'Obserwuj wszystkich',
    demoSkip: '[DEMO] @{username} zostalby usuniety z obserwowanych (symulacja)',
    demoFollow: '[DEMO] @{username} zostalby zaobserwowany (symulacja)',
    timerExpired: 'Minutnik wygasl, zatrzymywanie...',
    notifComplete: 'Zakonczone! Usunieto: {unfollowed}, Pominieto: {skipped}',
    verifiedSkip: '@{username} jest zweryfikowany, pomijanie',
    modeOveractive: 'Nadaktywni',
    overactiveSkip: '@{username} nie jest nadaktywny, pomijanie',
    overactiveMatch: '@{username} jest nadaktywny ({rate} tweetow/dzien)',
    softCooldown: 'Lagodne oczekiwanie... {seconds}s',
    refollowed: '@{username} zaobserwowany ponownie',
    refollowFailed: 'Nie udalo sie ponownie zaobserwowac @{username}',
    profileUnavailable: '@{username} profil niedostepny, pomijanie'
        },
        it: {
    loaded: 'X Unfollow Tool caricato!',
    started: 'Processo avviato...',
    modeNonFollowers: 'Non ricambiano',
    modeAll: 'Tutti',
    modeInactive: 'Account inattivi',
    mode: 'Modalita: {mode}',
    whitelist: 'Lista bianca: {count} utenti',
    whitelisted: '@{username} e in lista bianca, salto',
    followsBack: '@{username} ti segue, salto',
    unfollowed: '@{username} rimosso dai seguiti',
    fetchingProfile: 'Controllo profilo @{username}...',
    inactiveSkip: '@{username} e attivo, salto',
    loading: 'Caricamento altri utenti...',
    listEnd: 'Raggiunta la fine della lista',
    tabHidden: 'Scheda in background, in attesa...',
    tabActive: 'Scheda di nuovo attiva',
    completed: 'Completato! Rimossi: {unfollowed}, Saltati: {skipped}',
    stopRequest: 'Richiesta di arresto ricevuta...',
    paused: 'Processo in pausa',
    resumed: 'Processo ripreso',
    limitReached: 'Limite raggiunto ({limit} utenti)',
    confirmFailed: '@{username} pulsante di conferma non trovato, salto',
    noUnfollowBtn: '@{username} pulsante rimozione non trovato, salto',
    selectorError: 'Elemento DOM non trovato: {selector}',
    rateLimitDetected: 'Limite di richieste rilevato! In attesa...',
    rateLimitWaiting: 'Attesa limite richieste... {minutes} min rimanenti',
    rateLimitResume: 'Attesa terminata, ripresa del processo',
    bioMatch: '@{username} trovata corrispondenza nella bio',
    bioSkip: '@{username} bio non corrisponde, salto',
    bioProtected: '@{username} protezione bio, salto',
    followed: '@{username} seguito',
    followSkip: '@{username} gia seguito, salto',
    followersSkip: '@{username} ha abbastanza follower ({count}), salto',
    modeBioFilter: 'Filtro bio',
    modeFollowAll: 'Segui tutti',
    demoSkip: '[DEMO] @{username} verrebbe rimosso dai seguiti (simulazione)',
    demoFollow: '[DEMO] @{username} verrebbe seguito (simulazione)',
    timerExpired: 'Timer scaduto, arresto in corso...',
    notifComplete: 'Completato! Rimossi: {unfollowed}, Saltati: {skipped}',
    verifiedSkip: '@{username} e verificato, salto',
    modeOveractive: 'Iperattivi',
    overactiveSkip: '@{username} non e iperattivo, salto',
    overactiveMatch: '@{username} e iperattivo ({rate} tweet/giorno)',
    softCooldown: 'Attesa leggera... {seconds}s',
    refollowed: '@{username} riseguito',
    refollowFailed: 'Impossibile riseguire @{username}',
    profileUnavailable: '@{username} profilo non disponibile, salto'
        },
        nl: {
    loaded: 'X Unfollow Tool geladen!',
    started: 'Proces gestart...',
    modeNonFollowers: 'Niet-volgers',
    modeAll: 'Iedereen',
    modeInactive: 'Inactieve accounts',
    mode: 'Modus: {mode}',
    whitelist: 'Witte lijst: {count} gebruikers',
    whitelisted: '@{username} staat op de witte lijst, wordt overgeslagen',
    followsBack: '@{username} volgt je terug, wordt overgeslagen',
    unfollowed: '@{username} ontvolgd',
    fetchingProfile: 'Profiel van @{username} wordt gecontroleerd...',
    inactiveSkip: '@{username} is actief, wordt overgeslagen',
    loading: 'Meer gebruikers laden...',
    listEnd: 'Einde van de lijst bereikt',
    tabHidden: 'Tabblad op achtergrond, wachten...',
    tabActive: 'Tabblad weer actief',
    completed: 'Voltooid! Ontvolgd: {unfollowed}, Overgeslagen: {skipped}',
    stopRequest: 'Stopverzoek ontvangen...',
    paused: 'Proces gepauzeerd',
    resumed: 'Proces hervat',
    limitReached: 'Limiet bereikt ({limit} gebruikers)',
    confirmFailed: '@{username} bevestigingsknop niet gevonden, wordt overgeslagen',
    noUnfollowBtn: '@{username} ontvolg-knop niet gevonden, wordt overgeslagen',
    selectorError: 'DOM-element niet gevonden: {selector}',
    rateLimitDetected: 'Snelheidslimiet gedetecteerd! Wachten...',
    rateLimitWaiting: 'Snelheidslimiet wachttijd... {minutes} min resterend',
    rateLimitResume: 'Wachttijd voorbij, proces wordt hervat',
    bioMatch: '@{username} bio-trefwoord komt overeen',
    bioSkip: '@{username} bio komt niet overeen, wordt overgeslagen',
    bioProtected: '@{username} bio-bescherming, wordt overgeslagen',
    followed: '@{username} gevolgd',
    followSkip: '@{username} wordt al gevolgd, wordt overgeslagen',
    followersSkip: '@{username} heeft genoeg volgers ({count}), wordt overgeslagen',
    modeBioFilter: 'Bio-filter',
    modeFollowAll: 'Iedereen volgen',
    demoSkip: '[DEMO] @{username} zou worden ontvolgd (simulatie)',
    demoFollow: '[DEMO] @{username} zou worden gevolgd (simulatie)',
    timerExpired: 'Timer verlopen, wordt gestopt...',
    notifComplete: 'Voltooid! Ontvolgd: {unfollowed}, Overgeslagen: {skipped}',
    verifiedSkip: '@{username} is geverifieerd, wordt overgeslagen',
    modeOveractive: 'Overactief',
    overactiveSkip: '@{username} is niet overactief, wordt overgeslagen',
    overactiveMatch: '@{username} is overactief ({rate} tweets/dag)',
    softCooldown: 'Zachte wachttijd... {seconds}s',
    refollowed: '@{username} opnieuw gevolgd',
    refollowFailed: 'Kon @{username} niet opnieuw volgen',
    profileUnavailable: '@{username} profiel niet beschikbaar, wordt overgeslagen'
        },
        zh_TW: {
    loaded: 'X Unfollow Tool 已載入！',
    started: '流程已開始...',
    modeNonFollowers: '未回追者',
    modeAll: '所有人',
    modeInactive: '不活躍帳號',
    mode: '模式：{mode}',
    whitelist: '白名單：{count} 位使用者',
    whitelisted: '@{username} 在白名單中，已跳過',
    followsBack: '@{username} 有回追你，已跳過',
    unfollowed: '已取消追蹤 @{username}',
    fetchingProfile: '正在檢查 @{username} 的個人檔案...',
    inactiveSkip: '@{username} 仍然活躍，已跳過',
    loading: '正在載入更多使用者...',
    listEnd: '已到達清單底部',
    tabHidden: '分頁在背景中，等待中...',
    tabActive: '分頁已重新啟用',
    completed: '已完成！取消追蹤：{unfollowed}，跳過：{skipped}',
    stopRequest: '已收到停止要求...',
    paused: '流程已暫停',
    resumed: '流程已繼續',
    limitReached: '已達上限（{limit} 位使用者）',
    confirmFailed: '找不到 @{username} 的確認按鈕，已跳過',
    noUnfollowBtn: '找不到 @{username} 的取消追蹤按鈕，已跳過',
    selectorError: '找不到 DOM 元素：{selector}',
    rateLimitDetected: '偵測到速率限制！等待中...',
    rateLimitWaiting: '速率限制等待中... 剩餘 {minutes} 分鐘',
    rateLimitResume: '等待結束，流程繼續',
    bioMatch: '在 @{username} 的自介中找到符合的關鍵字',
    bioSkip: '@{username} 的自介不符合，已跳過',
    bioProtected: '@{username} 受自介保護，已跳過',
    followed: '已追蹤 @{username}',
    followSkip: '已在追蹤 @{username}，已跳過',
    followersSkip: '@{username} 已有足夠追蹤者（{count}），已跳過',
    modeBioFilter: '自介篩選',
    modeFollowAll: '全部追蹤',
    demoSkip: '[示範] @{username} 將會被取消追蹤（模擬）',
    demoFollow: '[示範] @{username} 將會被追蹤（模擬）',
    timerExpired: '計時器已到期，正在停止...',
    notifComplete: '已完成！取消追蹤：{unfollowed}，跳過：{skipped}',
    verifiedSkip: '@{username} 是已驗證帳號，已跳過',
    modeOveractive: '過度活躍',
    overactiveSkip: '@{username} 並非過度活躍，已跳過',
    overactiveMatch: '@{username} 過度活躍（每日 {rate} 則推文）',
    softCooldown: '緩衝冷卻中... {seconds} 秒',
    refollowed: '已重新追蹤 @{username}',
    refollowFailed: '無法重新追蹤 @{username}',
    profileUnavailable: '無法取得 @{username} 的個人檔案，已跳過'
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
        if (lang === 'zh-TW' || lang === 'zh-HK') return 'zh_TW';
        if (lang.startsWith('zh')) return 'zh';
        if (lang.startsWith('de')) return 'de';
        if (lang.startsWith('fr')) return 'fr';
        if (lang.startsWith('ar')) return 'ar';
        if (lang.startsWith('ko')) return 'ko';
        if (lang.startsWith('hi')) return 'hi';
        if (lang.startsWith('th')) return 'th';
        if (lang.startsWith('id')) return 'id';
        if (lang.startsWith('pl')) return 'pl';
        if (lang.startsWith('it')) return 'it';
        if (lang.startsWith('nl')) return 'nl';
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

        // Bio-filter mode - fetch real bio via profile API
        if (currentMode === 'bio-filter') {
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

            const bioText = profile.bio || '';
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
        const startTime = Date.now();
        const totalEstimate = unfollowLimit > 0 ? unfollowLimit : 0;
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

                    // Send progress update
                    chrome.runtime.sendMessage({
                        type: 'progress',
                        unfollowed: stats.unfollowed,
                        total: totalEstimate,
                        elapsed: Date.now() - startTime
                    }).catch(() => { });

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
                            // Trigger review prompt during rate limit wait
                            if (stats.unfollowed >= 10) {
                                chrome.runtime.sendMessage({ type: 'rateLimitPrompt', unfollowed: stats.unfollowed }).catch(() => {});
                            }
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

        if (message.action === 'preview') {
            const previewWhitelist = (message.whitelist || []).map(u => u.toLowerCase().replace('@', ''));
            const previewMode = message.mode || 'non-followers';
            const userCells = document.querySelectorAll(SELECTORS.userCell);
            const wouldUnfollow = [];
            for (const userCell of userCells) {
                if (wouldUnfollow.length >= 50) break;
                const username = getUsername(userCell);
                if (!username) continue;
                if (previewWhitelist.includes(username.toLowerCase())) continue;
                if (previewMode === 'non-followers') {
                    if (userFollowsBack(userCell)) continue;
                }
                wouldUnfollow.push(username);
            }
            const isEstimated = ['inactive', 'overactive', 'bio-filter'].includes(previewMode);
            chrome.runtime.sendMessage({
                type: 'previewResult',
                users: wouldUnfollow,
                estimated: isEstimated
            }).catch(() => {});
            sendResponse({ success: true });
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
