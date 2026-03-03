// Localization - X Unfollow Tool
// Detects Chrome language and provides translations

const translations = {
    tr: {
        // Popup UI
        title: 'Unfollow Tool',
        subtitle: 'Takip listenizi kolayca yönetin.',
        modeTitle: 'Mod Seçimi',
        modeNonFollowers: 'Takip Etmeyenler',
        modeNonFollowersDesc: 'Sadece sizi takip etmeyenleri çıkar',
        modeAll: 'Herkesi Çıkar',
        modeAllDesc: 'Tüm takip ettiklerini çıkar',
        modeInactive: 'Pasif Hesaplar',
        modeInactiveDesc: 'Pasif ve varsayılan avatarlı hesapları çıkar',
        whitelistTitle: 'Whitelist',
        whitelistPlaceholder: 'Korunacak kullanıcı adları (her satıra bir tane)\n\nÖrnek:\nelonmusk\ntwitter',
        whitelistHint: 'Bu kullanıcılar takipten çıkarılmayacak',
        statUnfollowed: 'Çıkarılan',
        statSkipped: 'Atlanan',
        statScanned: 'Taranan',
        btnStart: 'Başlat',
        btnStop: 'Durdur',
        btnPause: 'Durakla',
        btnResume: 'Devam Et',
        logTitle: 'İşlem Logları',

        // Menu
        menuTitle: 'Ayarlar',
        menuWhitelist: 'Whitelist',
        menuLogs: 'İşlem Logları',
        menuLanguage: 'Dil',
        menuAbout: 'Hakkında',
        menuHistory: 'Unfollow Geçmişi',
        menuSpeed: 'Hız Ayarı',
        menuExport: 'Dışa Aktar',
        menuImport: 'İçe Aktar',
        menuTheme: 'Tema',
        themeDark: 'Koyu',
        themeLight: 'Açık',

        // Speed
        speedSlow: 'Yavaş',
        speedNormal: 'Normal',
        speedFast: 'Hızlı',

        // Inactive threshold
        inactiveThresholdLabel: 'Pasiflik Süresi',
        inactive30: '30 gün',
        inactive90: '90 gün',
        inactive180: '180 gün',
        inactive365: '1 yıl',

        // Limit
        limitLabel: 'Unfollow Limiti',
        limitPlaceholder: '0 = limitsiz',
        limitHint: 'Maksimum unfollow sayısı (0 = limitsiz)',

        // History
        historyTitle: 'Unfollow Geçmişi',
        historyEmpty: 'Henüz geçmiş yok',
        historyClear: 'Geçmişi Temizle',

        // Export/Import
        exportSuccess: 'Veriler kopyalandı!',
        importSuccess: 'Veriler içeri aktarıldı!',
        importError: 'Geçersiz veri formatı',
        exportTitle: 'Dışa / İçe Aktar',

        // Status messages
        statusGoToFollowing: 'X.com\'da takip edilenlere gidin',
        statusGoingToFollowing: 'Following sayfasına gidiliyor',
        statusGoToProfile: 'Bir profil sayfasına gidin',
        statusPageError: 'Sayfa kontrol edilemedi',
        statusRunning: 'İşlem devam ediyor...',
        statusPaused: 'Duraklatıldı',
        statusStarted: 'İşlem başlatıldı',
        statusStopped: 'Durduruldu',
        statusCompleted: 'Tamamlandı',
        statusStartError: 'Başlatılamadı. Sayfayı yenileyin.',
        warningSlowMode: 'Bu mod her profili tek tek kontrol eder, daha uzun sürebilir.',

        // Button texts
        btnOpenX: 'X.com\'u Aç',
        btnGoToProfile: 'Profilime Git',

        // Log messages
        logStarted: 'İşlem başlatıldı',
        logModeNonFollowers: 'Mod: Takip Etmeyenler',
        logModeAll: 'Mod: Herkes',
        logWhitelist: 'Whitelist: {count} kullanıcı',
        logGoingToFollowing: '@{username}/following sayfasına gidiliyor...',
        logGoingToHome: 'X.com ana sayfasına gidiliyor...',
        logModeInactive: 'Mod: Pasif Hesaplar',
        logModeBioFilter: 'Mod: Bio Filtresi',
        logModeFollowAll: 'Mod: Tümünü Takip Et',
        logStopped: 'İşlem durduruldu',
        logCompleted: 'İşlem tamamlandı',
        logError: 'Hata: {message}',
        logStopError: 'Durdurma hatası: {message}',

        // Whitelist validation
        whitelistInvalid: 'Geçersiz kullanıcı adı: {username}',
        whitelistValidCount: '{valid} geçerli, {invalid} geçersiz kullanıcı',

        // Bio filter
        modeBioFilter: 'Bio Filtresi',
        modeBioFilterDesc: 'Bio anahtar kelimelerine göre filtrele',
        bioKeywordsLabel: 'Bio Anahtar Kelimeler',
        bioKeywordsPlaceholder: 'crypto, nft, bot',
        bioActionLabel: 'Eylem',
        bioActionUnfollow: 'Bio\'da varsa çıkar',
        bioActionKeep: 'Bio\'da varsa koru',

        // Follow all
        modeFollowAll: 'Tümünü Takip Et',
        modeFollowAllDesc: 'Listedeki herkesi takip et',
        statFollowed: 'Takip Edilen',

        // Inactive filter
        inactiveDaysLabel: 'Pasiflik Süresi',
        minFollowersLabel: 'Min. Takipçi',
        minFollowersPlaceholder: '0 = filtre yok',
        inactive60: '60 gün',

        // Demo mode
        demoModeLabel: 'Demo Mod',
        demoModeDesc: 'Simülasyon - gerçekte işlem yapmaz',

        // Auto-stop timer
        timerLabel: 'Zamanlayıcı',
        timerPlaceholder: '0 = kapalı',
        timerMinutes: 'dk',

        // Target profile
        targetLabel: 'Hedef Profil',
        targetPlaceholder: 'kullaniciadi (boş = kendin)',

        // Stats dashboard
        menuStats: 'İstatistikler',
        statsTitle: 'İstatistik Paneli',
        statsAllTime: 'Toplam Çıkarılan',
        statsThisWeek: 'Bu Hafta',
        statsSessions: 'Toplam Oturum',
        statsNonFollowerRate: 'Takip Etmeyen Oranı',

        // Notification
        notifSoundLabel: 'Bildirim Sesi',
        notifCompleteTitle: 'İşlem Tamamlandı!',
        notifCompleteMsg: 'Çıkarılan: {unfollowed}, Atlanan: {skipped}',

        // Shortcuts
        shortcutHint: 'Kısayollar: Alt+Shift+S (Başlat/Durdur), Alt+Shift+P (Duraklat)',

        // Rate
        menuRate: 'Bizi Değerlendirin',

        // Review prompt
        reviewAsk: 'XUnfollow işinize yarıyor mu?',
        reviewYes: 'Evet, değerlendir!',
        reviewLater: 'Sonra',
        reviewNo: 'Hayır',

        // CSV Export
        exportCsv: 'CSV',
        exportCsvSuccess: 'CSV dosyası indirildi!',

        // Skip Verified
        skipVerifiedLabel: 'Onaylıları Atla',

        // Overactive Mode
        modeOveractive: 'Aşırı Aktif',
        modeOveractiveDesc: 'Günlük çok fazla tweet atan hesapları çıkar',
        overactiveThresholdLabel: 'Günlük Tweet Eşiği',
        logModeOveractive: 'Mod: Aşırı Aktif',

        // Cooldown
        cooldownNormal: 'Normal',
        cooldownSoft: 'Yumuşak bekleme',
        cooldownRateLimit: 'Rate limit',

        // Refollow
        refollowBtn: 'Geri Takip',
        refollowTitle: 'Tekrar takip et',
        refollowSuccess: '@{username} tekrar takip edildi',
        refollowError: '@{username} takip edilemedi',
        refollowedLabel: 'Geri takip edildi',

        // Tab names
        tabHome: 'Ana',
        tabLogs: 'Log',
        tabHistory: 'Geçmiş',
        tabSettings: 'Ayarlar',

        // Section titles
        sectionMode: 'Mod',
        sectionConfig: 'Yapılandırma',
        sectionGeneral: 'Genel',
        sectionAppearance: 'Görünüm',

        // Notification permission
        notifPermissionDenied: 'Bildirim izni reddedildi',

        // Connection status
        statusNotConnected: 'Content script bağlı değil. Sayfayı yenileyin.',

        // Onboarding
        onboardingTitle: 'X Unfollow Tool\'a Hoş Geldiniz',
        onboardingStep1Title: 'Mod Seçin',
        onboardingStep1Desc: 'Kimi takipten çıkaracağınızı belirleyin: takip etmeyenler, pasif hesaplar veya bio filtresi.',
        onboardingStep2Title: 'Whitelist Ayarlayın',
        onboardingStep2Desc: 'Korumak istediğiniz kullanıcı adlarını ekleyin.',
        onboardingStep3Title: 'İşlemi Başlatın',
        onboardingStep3Desc: 'X.com\'da following sayfasına gidin ve Başlat\'a tıklayın.',
        onboardingDone: 'Anladım!'
    },

    en: {
        // Popup UI
        title: 'Unfollow Tool',
        subtitle: 'Easily manage your following list.',
        modeTitle: 'Mode Selection',
        modeNonFollowers: 'Non-Followers',
        modeNonFollowersDesc: 'Only unfollow those who don\'t follow you',
        modeAll: 'Unfollow All',
        modeAllDesc: 'Unfollow everyone you follow',
        modeInactive: 'Inactive Accounts',
        modeInactiveDesc: 'Unfollow inactive and default avatar accounts',
        whitelistTitle: 'Whitelist',
        whitelistPlaceholder: 'Usernames to protect (one per line)\n\nExample:\nelonmusk\ntwitter',
        whitelistHint: 'These users will not be unfollowed',
        statUnfollowed: 'Unfollowed',
        statSkipped: 'Skipped',
        statScanned: 'Scanned',
        btnStart: 'Start',
        btnStop: 'Stop',
        btnPause: 'Pause',
        btnResume: 'Resume',
        logTitle: 'Activity Log',

        // Menu
        menuTitle: 'Settings',
        menuWhitelist: 'Whitelist',
        menuLogs: 'Activity Log',
        menuLanguage: 'Language',
        menuAbout: 'About',
        menuHistory: 'Unfollow History',
        menuSpeed: 'Speed',
        menuExport: 'Export',
        menuImport: 'Import',
        menuTheme: 'Theme',
        themeDark: 'Dark',
        themeLight: 'Light',

        // Speed
        speedSlow: 'Slow',
        speedNormal: 'Normal',
        speedFast: 'Fast',

        // Inactive threshold
        inactiveThresholdLabel: 'Inactive Period',
        inactive30: '30 days',
        inactive90: '90 days',
        inactive180: '180 days',
        inactive365: '1 year',

        // Limit
        limitLabel: 'Unfollow Limit',
        limitPlaceholder: '0 = unlimited',
        limitHint: 'Max unfollows (0 = unlimited)',

        // History
        historyTitle: 'Unfollow History',
        historyEmpty: 'No history yet',
        historyClear: 'Clear History',

        // Export/Import
        exportSuccess: 'Data copied to clipboard!',
        importSuccess: 'Data imported successfully!',
        importError: 'Invalid data format',
        exportTitle: 'Export / Import',

        // Status messages
        statusGoToFollowing: 'Go to X.com following page',
        statusGoingToFollowing: 'Going to following page',
        statusGoToProfile: 'Go to a profile page',
        statusPageError: 'Could not check page',
        statusRunning: 'Running...',
        statusPaused: 'Paused',
        statusStarted: 'Started',
        statusStopped: 'Stopped',
        statusCompleted: 'Completed',
        statusStartError: 'Could not start. Refresh the page.',
        warningSlowMode: 'This mode checks each profile individually. It may take longer.',

        // Button texts
        btnOpenX: 'Open X.com',
        btnGoToProfile: 'Go to Profile',

        // Log messages
        logStarted: 'Process started',
        logModeNonFollowers: 'Mode: Non-Followers',
        logModeAll: 'Mode: Everyone',
        logWhitelist: 'Whitelist: {count} users',
        logGoingToFollowing: 'Going to @{username}/following...',
        logGoingToHome: 'Going to X.com home page...',
        logModeInactive: 'Mode: Inactive Accounts',
        logModeBioFilter: 'Mode: Bio Filter',
        logModeFollowAll: 'Mode: Follow All',
        logStopped: 'Process stopped',
        logCompleted: 'Process completed',
        logError: 'Error: {message}',
        logStopError: 'Stop error: {message}',

        // Whitelist validation
        whitelistInvalid: 'Invalid username: {username}',
        whitelistValidCount: '{valid} valid, {invalid} invalid users',

        // Bio filter
        modeBioFilter: 'Bio Filter',
        modeBioFilterDesc: 'Filter by bio keywords',
        bioKeywordsLabel: 'Bio Keywords',
        bioKeywordsPlaceholder: 'crypto, nft, bot',
        bioActionLabel: 'Action',
        bioActionUnfollow: 'Unfollow if in bio',
        bioActionKeep: 'Keep if in bio',

        // Follow all
        modeFollowAll: 'Follow All',
        modeFollowAllDesc: 'Follow everyone on the list',
        statFollowed: 'Followed',

        // Inactive filter
        inactiveDaysLabel: 'Inactive Period',
        minFollowersLabel: 'Min. Followers',
        minFollowersPlaceholder: '0 = no filter',
        inactive60: '60 days',

        // Demo mode
        demoModeLabel: 'Demo Mode',
        demoModeDesc: 'Simulation only - no real actions',

        // Auto-stop timer
        timerLabel: 'Timer',
        timerPlaceholder: '0 = off',
        timerMinutes: 'min',

        // Target profile
        targetLabel: 'Target Profile',
        targetPlaceholder: 'username (empty = self)',

        // Stats dashboard
        menuStats: 'Statistics',
        statsTitle: 'Stats Dashboard',
        statsAllTime: 'Total Unfollowed',
        statsThisWeek: 'This Week',
        statsSessions: 'Total Sessions',
        statsNonFollowerRate: 'Non-Follower Rate',

        // Notification
        notifSoundLabel: 'Notification Sound',
        notifCompleteTitle: 'Process Completed!',
        notifCompleteMsg: 'Unfollowed: {unfollowed}, Skipped: {skipped}',

        // Shortcuts
        shortcutHint: 'Shortcuts: Alt+Shift+S (Start/Stop), Alt+Shift+P (Pause)',

        // Rate
        menuRate: 'Rate Us',

        // Review prompt
        reviewAsk: 'Enjoying XUnfollow?',
        reviewYes: 'Yes, rate it!',
        reviewLater: 'Later',
        reviewNo: 'No thanks',

        // CSV Export
        exportCsv: 'CSV',
        exportCsvSuccess: 'CSV file downloaded!',

        // Skip Verified
        skipVerifiedLabel: 'Skip Verified',

        // Overactive Mode
        modeOveractive: 'Overactive',
        modeOveractiveDesc: 'Unfollow accounts tweeting excessively',
        overactiveThresholdLabel: 'Daily Tweet Threshold',
        logModeOveractive: 'Mode: Overactive',

        // Cooldown
        cooldownNormal: 'Normal',
        cooldownSoft: 'Soft cooldown',
        cooldownRateLimit: 'Rate limit',

        // Refollow
        refollowBtn: 'Refollow',
        refollowTitle: 'Follow back again',
        refollowSuccess: '@{username} refollowed',
        refollowError: 'Could not refollow @{username}',
        refollowedLabel: 'Refollowed',

        // Tab names
        tabHome: 'Home',
        tabLogs: 'Log',
        tabHistory: 'History',
        tabSettings: 'Settings',

        // Section titles
        sectionMode: 'Mode',
        sectionConfig: 'Configuration',
        sectionGeneral: 'General',
        sectionAppearance: 'Appearance',

        // Notification permission
        notifPermissionDenied: 'Notification permission denied',

        // Connection status
        statusNotConnected: 'Content script not connected. Refresh the page.',

        // Onboarding
        onboardingTitle: 'Welcome to X Unfollow Tool',
        onboardingStep1Title: 'Choose a Mode',
        onboardingStep1Desc: 'Select who to unfollow: non-followers, inactive accounts, or use bio filters.',
        onboardingStep2Title: 'Set Your Whitelist',
        onboardingStep2Desc: 'Add usernames you want to protect from being unfollowed.',
        onboardingStep3Title: 'Start the Process',
        onboardingStep3Desc: 'Go to your following page on X.com and click Start.',
        onboardingDone: 'Got it!'
    },

    ja: {
        // Popup UI
        title: 'Unfollow Tool',
        subtitle: 'フォローリストを簡単に管理。',
        modeTitle: 'モード選択',
        modeNonFollowers: 'フォローバックなし',
        modeNonFollowersDesc: 'フォローバックしていないユーザーのみ解除',
        modeAll: '全員解除',
        modeAllDesc: 'フォロー中の全ユーザーを解除',
        modeInactive: '非アクティブ',
        modeInactiveDesc: '非アクティブ・デフォルトアバターのアカウントを解除',
        whitelistTitle: 'ホワイトリスト',
        whitelistPlaceholder: '保護するユーザー名（1行に1つ）\n\n例:\nelonmusk\ntwitter',
        whitelistHint: 'これらのユーザーはフォロー解除されません',
        statUnfollowed: '解除済み',
        statSkipped: 'スキップ',
        statScanned: 'スキャン済み',
        btnStart: '開始',
        btnStop: '停止',
        btnPause: '一時停止',
        btnResume: '再開',
        logTitle: 'アクティビティログ',

        // Menu
        menuTitle: '設定',
        menuWhitelist: 'ホワイトリスト',
        menuLogs: 'アクティビティログ',
        menuLanguage: '言語',
        menuAbout: 'について',
        menuHistory: 'フォロー解除履歴',
        menuSpeed: '速度',
        menuExport: 'エクスポート',
        menuImport: 'インポート',
        menuTheme: 'テーマ',
        themeDark: 'ダーク',
        themeLight: 'ライト',

        // Speed
        speedSlow: '低速',
        speedNormal: '通常',
        speedFast: '高速',

        // Inactive threshold
        inactiveThresholdLabel: '非アクティブ期間',
        inactive30: '30日',
        inactive90: '90日',
        inactive180: '180日',
        inactive365: '1年',

        // Limit
        limitLabel: 'フォロー解除制限',
        limitPlaceholder: '0 = 無制限',
        limitHint: '最大フォロー解除数（0 = 無制限）',

        // History
        historyTitle: 'フォロー解除履歴',
        historyEmpty: '履歴がありません',
        historyClear: '履歴をクリア',

        // Export/Import
        exportSuccess: 'データをクリップボードにコピーしました！',
        importSuccess: 'データのインポートに成功しました！',
        importError: '無効なデータ形式です',
        exportTitle: 'エクスポート / インポート',

        // Status messages
        statusGoToFollowing: 'X.comのフォロー中ページに移動してください',
        statusGoingToFollowing: 'フォロー中ページに移動中',
        statusGoToProfile: 'プロフィールページに移動してください',
        statusPageError: 'ページを確認できませんでした',
        statusRunning: '実行中...',
        statusPaused: '一時停止中',
        statusStarted: '開始しました',
        statusStopped: '停止しました',
        statusCompleted: '完了しました',
        statusStartError: '開始できませんでした。ページを更新してください。',
        warningSlowMode: 'このモードは各プロフィールを個別に確認するため、時間がかかる場合があります。',

        // Button texts
        btnOpenX: 'X.comを開く',
        btnGoToProfile: 'プロフィールへ',

        // Log messages
        logStarted: 'プロセスを開始しました',
        logModeNonFollowers: 'モード: フォローバックなし',
        logModeAll: 'モード: 全員',
        logWhitelist: 'ホワイトリスト: {count}ユーザー',
        logGoingToFollowing: '@{username}/followingに移動中...',
        logGoingToHome: 'X.comホームページに移動中...',
        logModeInactive: 'モード: 非アクティブ',
        logModeBioFilter: 'モード: バイオフィルター',
        logModeFollowAll: 'モード: 全員フォロー',
        logStopped: 'プロセスを停止しました',
        logCompleted: 'プロセスが完了しました',
        logError: 'エラー: {message}',
        logStopError: '停止エラー: {message}',

        // Whitelist validation
        whitelistInvalid: '無効なユーザー名: {username}',
        whitelistValidCount: '{valid}件有効、{invalid}件無効',

        // Bio filter
        modeBioFilter: 'バイオフィルター',
        modeBioFilterDesc: 'バイオのキーワードでフィルター',
        bioKeywordsLabel: 'バイオキーワード',
        bioKeywordsPlaceholder: 'crypto, nft, bot',
        bioActionLabel: 'アクション',
        bioActionUnfollow: 'バイオにあれば解除',
        bioActionKeep: 'バイオにあれば保護',

        // Follow all
        modeFollowAll: '全員フォロー',
        modeFollowAllDesc: 'リストの全員をフォロー',
        statFollowed: 'フォロー済み',

        // Inactive filter
        inactiveDaysLabel: '非アクティブ期間',
        minFollowersLabel: '最小フォロワー',
        minFollowersPlaceholder: '0 = フィルターなし',
        inactive60: '60日',

        // Demo mode
        demoModeLabel: 'デモモード',
        demoModeDesc: 'シミュレーションのみ - 実際の操作なし',

        // Auto-stop timer
        timerLabel: 'タイマー',
        timerPlaceholder: '0 = オフ',
        timerMinutes: '分',

        // Target profile
        targetLabel: 'ターゲットプロフィール',
        targetPlaceholder: 'ユーザー名（空 = 自分）',

        // Stats dashboard
        menuStats: '統計',
        statsTitle: '統計ダッシュボード',
        statsAllTime: '合計解除数',
        statsThisWeek: '今週',
        statsSessions: '合計セッション',
        statsNonFollowerRate: '非フォロワー率',

        // Notification
        notifSoundLabel: '通知音',
        notifCompleteTitle: 'プロセスが完了しました！',
        notifCompleteMsg: '解除: {unfollowed}、スキップ: {skipped}',

        // Shortcuts
        shortcutHint: 'ショートカット: Alt+Shift+S (開始/停止), Alt+Shift+P (一時停止)',

        // Rate
        menuRate: '評価する',

        // Review prompt
        reviewAsk: 'XUnfollowは役立っていますか？',
        reviewYes: '評価する！',
        reviewLater: '後で',
        reviewNo: '結構です',

        // CSV Export
        exportCsv: 'CSV',
        exportCsvSuccess: 'CSVファイルがダウンロードされました！',

        // Skip Verified
        skipVerifiedLabel: '認証済みをスキップ',

        // Overactive Mode
        modeOveractive: '過活動',
        modeOveractiveDesc: '過剰にツイートするアカウントを解除',
        overactiveThresholdLabel: '日次ツイート閾値',
        logModeOveractive: 'モード: 過活動',

        // Cooldown
        cooldownNormal: '通常',
        cooldownSoft: 'ソフトクールダウン',
        cooldownRateLimit: 'レート制限',

        // Refollow
        refollowBtn: '再フォロー',
        refollowTitle: '再びフォローする',
        refollowSuccess: '@{username} を再フォローしました',
        refollowError: '@{username} を再フォローできませんでした',
        refollowedLabel: '再フォロー済み',

        // Tab names
        tabHome: 'ホーム',
        tabLogs: 'ログ',
        tabHistory: '履歴',
        tabSettings: '設定',

        // Section titles
        sectionMode: 'モード',
        sectionConfig: '設定',
        sectionGeneral: '一般',
        sectionAppearance: '外観',

        // Notification permission
        notifPermissionDenied: '通知の許可が拒否されました',

        // Connection status
        statusNotConnected: 'コンテンツスクリプトが接続されていません。ページを更新してください。',

        // Onboarding
        onboardingTitle: 'X Unfollow Toolへようこそ',
        onboardingStep1Title: 'モードを選択',
        onboardingStep1Desc: 'フォロー解除する対象を選択：非フォロワー、非アクティブ、バイオフィルター。',
        onboardingStep2Title: 'ホワイトリストを設定',
        onboardingStep2Desc: 'フォロー解除から保護するユーザー名を追加。',
        onboardingStep3Title: 'プロセスを開始',
        onboardingStep3Desc: 'X.comのフォロー中ページに移動して開始をクリック。',
        onboardingDone: 'わかりました！'
    },

    pt: {
        // Popup UI
        title: 'Unfollow Tool',
        subtitle: 'Gerencie facilmente sua lista de seguindo.',
        modeTitle: 'Seleção de Modo',
        modeNonFollowers: 'Não Seguidores',
        modeNonFollowersDesc: 'Deixar de seguir apenas quem não te segue',
        modeAll: 'Deixar de Seguir Todos',
        modeAllDesc: 'Deixar de seguir todos que você segue',
        modeInactive: 'Contas Inativas',
        modeInactiveDesc: 'Remover contas inativas e com avatar padrão',
        whitelistTitle: 'Lista Branca',
        whitelistPlaceholder: 'Nomes de usuário a proteger (um por linha)\n\nExemplo:\nelonmusk\ntwitter',
        whitelistHint: 'Estes usuários não serão removidos',
        statUnfollowed: 'Removidos',
        statSkipped: 'Pulados',
        statScanned: 'Verificados',
        btnStart: 'Iniciar',
        btnStop: 'Parar',
        btnPause: 'Pausar',
        btnResume: 'Continuar',
        logTitle: 'Log de Atividades',

        // Menu
        menuTitle: 'Configurações',
        menuWhitelist: 'Lista Branca',
        menuLogs: 'Log de Atividades',
        menuLanguage: 'Idioma',
        menuAbout: 'Sobre',
        menuHistory: 'Histórico de Unfollow',
        menuSpeed: 'Velocidade',
        menuExport: 'Exportar',
        menuImport: 'Importar',
        menuTheme: 'Tema',
        themeDark: 'Escuro',
        themeLight: 'Claro',

        // Speed
        speedSlow: 'Lento',
        speedNormal: 'Normal',
        speedFast: 'Rápido',

        // Inactive threshold
        inactiveThresholdLabel: 'Período de Inatividade',
        inactive30: '30 dias',
        inactive90: '90 dias',
        inactive180: '180 dias',
        inactive365: '1 ano',

        // Limit
        limitLabel: 'Limite de Unfollow',
        limitPlaceholder: '0 = ilimitado',
        limitHint: 'Máximo de unfollows (0 = ilimitado)',

        // History
        historyTitle: 'Histórico de Unfollow',
        historyEmpty: 'Nenhum histórico ainda',
        historyClear: 'Limpar Histórico',

        // Export/Import
        exportSuccess: 'Dados copiados para a área de transferência!',
        importSuccess: 'Dados importados com sucesso!',
        importError: 'Formato de dados inválido',
        exportTitle: 'Exportar / Importar',

        // Status messages
        statusGoToFollowing: 'Vá para a página de seguindo no X.com',
        statusGoingToFollowing: 'Indo para a página de seguindo',
        statusGoToProfile: 'Vá para uma página de perfil',
        statusPageError: 'Não foi possível verificar a página',
        statusRunning: 'Executando...',
        statusPaused: 'Pausado',
        statusStarted: 'Iniciado',
        statusStopped: 'Parado',
        statusCompleted: 'Concluído',
        statusStartError: 'Não foi possível iniciar. Atualize a página.',
        warningSlowMode: 'Este modo verifica cada perfil individualmente. Pode demorar mais.',

        // Button texts
        btnOpenX: 'Abrir X.com',
        btnGoToProfile: 'Ir para Perfil',

        // Log messages
        logStarted: 'Processo iniciado',
        logModeNonFollowers: 'Modo: Não Seguidores',
        logModeAll: 'Modo: Todos',
        logWhitelist: 'Lista Branca: {count} usuários',
        logGoingToFollowing: 'Indo para @{username}/following...',
        logGoingToHome: 'Indo para a página inicial do X.com...',
        logModeInactive: 'Modo: Contas Inativas',
        logModeBioFilter: 'Modo: Filtro de Bio',
        logModeFollowAll: 'Modo: Seguir Todos',
        logStopped: 'Processo parado',
        logCompleted: 'Processo concluído',
        logError: 'Erro: {message}',
        logStopError: 'Erro ao parar: {message}',

        // Whitelist validation
        whitelistInvalid: 'Nome de usuário inválido: {username}',
        whitelistValidCount: '{valid} válidos, {invalid} inválidos',

        // Bio filter
        modeBioFilter: 'Filtro de Bio',
        modeBioFilterDesc: 'Filtrar por palavras-chave da bio',
        bioKeywordsLabel: 'Palavras-chave da Bio',
        bioKeywordsPlaceholder: 'crypto, nft, bot',
        bioActionLabel: 'Ação',
        bioActionUnfollow: 'Remover se na bio',
        bioActionKeep: 'Manter se na bio',

        // Follow all
        modeFollowAll: 'Seguir Todos',
        modeFollowAllDesc: 'Seguir todos na lista',
        statFollowed: 'Seguidos',

        // Inactive filter
        inactiveDaysLabel: 'Período de Inatividade',
        minFollowersLabel: 'Min. Seguidores',
        minFollowersPlaceholder: '0 = sem filtro',
        inactive60: '60 dias',

        // Demo mode
        demoModeLabel: 'Modo Demo',
        demoModeDesc: 'Apenas simulação - sem ações reais',

        // Auto-stop timer
        timerLabel: 'Temporizador',
        timerPlaceholder: '0 = desligado',
        timerMinutes: 'min',

        // Target profile
        targetLabel: 'Perfil Alvo',
        targetPlaceholder: 'usuário (vazio = próprio)',

        // Stats dashboard
        menuStats: 'Estatísticas',
        statsTitle: 'Painel de Estatísticas',
        statsAllTime: 'Total Removidos',
        statsThisWeek: 'Esta Semana',
        statsSessions: 'Total de Sessões',
        statsNonFollowerRate: 'Taxa de Não Seguidores',

        // Notification
        notifSoundLabel: 'Som de Notificação',
        notifCompleteTitle: 'Processo Concluído!',
        notifCompleteMsg: 'Removidos: {unfollowed}, Pulados: {skipped}',

        // Shortcuts
        shortcutHint: 'Atalhos: Alt+Shift+S (Iniciar/Parar), Alt+Shift+P (Pausar)',

        // Rate
        menuRate: 'Avalie-nos',

        // Review prompt
        reviewAsk: 'Está gostando do XUnfollow?',
        reviewYes: 'Sim, avaliar!',
        reviewLater: 'Depois',
        reviewNo: 'Não, obrigado',

        // CSV Export
        exportCsv: 'CSV',
        exportCsvSuccess: 'Arquivo CSV baixado!',

        // Skip Verified
        skipVerifiedLabel: 'Pular Verificados',

        // Overactive Mode
        modeOveractive: 'Superativo',
        modeOveractiveDesc: 'Remover contas que tuitam excessivamente',
        overactiveThresholdLabel: 'Limite Diário de Tweets',
        logModeOveractive: 'Modo: Superativo',

        // Cooldown
        cooldownNormal: 'Normal',
        cooldownSoft: 'Cooldown suave',
        cooldownRateLimit: 'Rate limit',

        // Refollow
        refollowBtn: 'Reseguir',
        refollowTitle: 'Seguir novamente',
        refollowSuccess: '@{username} seguido novamente',
        refollowError: 'Não foi possível reseguir @{username}',
        refollowedLabel: 'Reseguido',

        // Tab names
        tabHome: 'Início',
        tabLogs: 'Log',
        tabHistory: 'Histórico',
        tabSettings: 'Config',

        // Section titles
        sectionMode: 'Modo',
        sectionConfig: 'Configuração',
        sectionGeneral: 'Geral',
        sectionAppearance: 'Aparência',

        // Notification permission
        notifPermissionDenied: 'Permissão de notificação negada',

        // Connection status
        statusNotConnected: 'Content script não conectado. Atualize a página.',

        // Onboarding
        onboardingTitle: 'Bem-vindo ao X Unfollow Tool',
        onboardingStep1Title: 'Escolha um Modo',
        onboardingStep1Desc: 'Selecione quem deixar de seguir: não seguidores, inativos ou filtro de bio.',
        onboardingStep2Title: 'Configure sua Lista Branca',
        onboardingStep2Desc: 'Adicione nomes de usuário que deseja proteger.',
        onboardingStep3Title: 'Inicie o Processo',
        onboardingStep3Desc: 'Vá para a página de seguindo no X.com e clique em Iniciar.',
        onboardingDone: 'Entendi!'
    },

    es: {
        // Popup UI
        title: 'Unfollow Tool',
        subtitle: 'Gestiona fácilmente tu lista de seguidos.',
        modeTitle: 'Selección de Modo',
        modeNonFollowers: 'No Seguidores',
        modeNonFollowersDesc: 'Solo dejar de seguir a quienes no te siguen',
        modeAll: 'Dejar de Seguir a Todos',
        modeAllDesc: 'Dejar de seguir a todos los que sigues',
        modeInactive: 'Cuentas Inactivas',
        modeInactiveDesc: 'Dejar de seguir cuentas inactivas y con avatar predeterminado',
        whitelistTitle: 'Lista Blanca',
        whitelistPlaceholder: 'Nombres de usuario a proteger (uno por línea)\n\nEjemplo:\nelonmusk\ntwitter',
        whitelistHint: 'Estos usuarios no serán eliminados',
        statUnfollowed: 'Eliminados',
        statSkipped: 'Omitidos',
        statScanned: 'Escaneados',
        btnStart: 'Iniciar',
        btnStop: 'Detener',
        btnPause: 'Pausar',
        btnResume: 'Reanudar',
        logTitle: 'Registro de Actividad',

        // Menu
        menuTitle: 'Configuración',
        menuWhitelist: 'Lista Blanca',
        menuLogs: 'Registro de Actividad',
        menuLanguage: 'Idioma',
        menuAbout: 'Acerca de',
        menuHistory: 'Historial de Unfollow',
        menuSpeed: 'Velocidad',
        menuExport: 'Exportar',
        menuImport: 'Importar',
        menuTheme: 'Tema',
        themeDark: 'Oscuro',
        themeLight: 'Claro',

        // Speed
        speedSlow: 'Lento',
        speedNormal: 'Normal',
        speedFast: 'Rápido',

        // Inactive threshold
        inactiveThresholdLabel: 'Periodo de Inactividad',
        inactive30: '30 días',
        inactive90: '90 días',
        inactive180: '180 días',
        inactive365: '1 año',

        // Limit
        limitLabel: 'Límite de Unfollow',
        limitPlaceholder: '0 = ilimitado',
        limitHint: 'Máximo de unfollows (0 = ilimitado)',

        // History
        historyTitle: 'Historial de Unfollow',
        historyEmpty: 'Sin historial aún',
        historyClear: 'Borrar Historial',

        // Export/Import
        exportSuccess: '¡Datos copiados al portapapeles!',
        importSuccess: '¡Datos importados exitosamente!',
        importError: 'Formato de datos inválido',
        exportTitle: 'Exportar / Importar',

        // Status messages
        statusGoToFollowing: 'Ve a la página de seguidos en X.com',
        statusGoingToFollowing: 'Yendo a la página de seguidos',
        statusGoToProfile: 'Ve a una página de perfil',
        statusPageError: 'No se pudo verificar la página',
        statusRunning: 'Ejecutando...',
        statusPaused: 'Pausado',
        statusStarted: 'Iniciado',
        statusStopped: 'Detenido',
        statusCompleted: 'Completado',
        statusStartError: 'No se pudo iniciar. Actualiza la página.',
        warningSlowMode: 'Este modo verifica cada perfil individualmente. Puede tardar más.',

        // Button texts
        btnOpenX: 'Abrir X.com',
        btnGoToProfile: 'Ir al Perfil',

        // Log messages
        logStarted: 'Proceso iniciado',
        logModeNonFollowers: 'Modo: No Seguidores',
        logModeAll: 'Modo: Todos',
        logWhitelist: 'Lista Blanca: {count} usuarios',
        logGoingToFollowing: 'Yendo a @{username}/following...',
        logGoingToHome: 'Yendo a la página principal de X.com...',
        logModeInactive: 'Modo: Cuentas Inactivas',
        logModeBioFilter: 'Modo: Filtro de Bio',
        logModeFollowAll: 'Modo: Seguir a Todos',
        logStopped: 'Proceso detenido',
        logCompleted: 'Proceso completado',
        logError: 'Error: {message}',
        logStopError: 'Error al detener: {message}',

        // Whitelist validation
        whitelistInvalid: 'Nombre de usuario inválido: {username}',
        whitelistValidCount: '{valid} válidos, {invalid} inválidos',

        // Bio filter
        modeBioFilter: 'Filtro de Bio',
        modeBioFilterDesc: 'Filtrar por palabras clave de la bio',
        bioKeywordsLabel: 'Palabras clave de Bio',
        bioKeywordsPlaceholder: 'crypto, nft, bot',
        bioActionLabel: 'Acción',
        bioActionUnfollow: 'Dejar de seguir si está en bio',
        bioActionKeep: 'Mantener si está en bio',

        // Follow all
        modeFollowAll: 'Seguir a Todos',
        modeFollowAllDesc: 'Seguir a todos en la lista',
        statFollowed: 'Seguidos',

        // Inactive filter
        inactiveDaysLabel: 'Periodo de Inactividad',
        minFollowersLabel: 'Min. Seguidores',
        minFollowersPlaceholder: '0 = sin filtro',
        inactive60: '60 días',

        // Demo mode
        demoModeLabel: 'Modo Demo',
        demoModeDesc: 'Solo simulación - sin acciones reales',

        // Auto-stop timer
        timerLabel: 'Temporizador',
        timerPlaceholder: '0 = apagado',
        timerMinutes: 'min',

        // Target profile
        targetLabel: 'Perfil Objetivo',
        targetPlaceholder: 'usuario (vacío = propio)',

        // Stats dashboard
        menuStats: 'Estadísticas',
        statsTitle: 'Panel de Estadísticas',
        statsAllTime: 'Total Eliminados',
        statsThisWeek: 'Esta Semana',
        statsSessions: 'Total de Sesiones',
        statsNonFollowerRate: 'Tasa de No Seguidores',

        // Notification
        notifSoundLabel: 'Sonido de Notificación',
        notifCompleteTitle: '¡Proceso Completado!',
        notifCompleteMsg: 'Eliminados: {unfollowed}, Omitidos: {skipped}',

        // Shortcuts
        shortcutHint: 'Atajos: Alt+Shift+S (Iniciar/Detener), Alt+Shift+P (Pausar)',

        // Rate
        menuRate: 'Califícanos',

        // Review prompt
        reviewAsk: '¿Te gusta XUnfollow?',
        reviewYes: '¡Sí, calificar!',
        reviewLater: 'Después',
        reviewNo: 'No, gracias',

        // CSV Export
        exportCsv: 'CSV',
        exportCsvSuccess: '¡Archivo CSV descargado!',

        // Skip Verified
        skipVerifiedLabel: 'Omitir Verificados',

        // Overactive Mode
        modeOveractive: 'Superactivo',
        modeOveractiveDesc: 'Dejar de seguir cuentas que tuitean en exceso',
        overactiveThresholdLabel: 'Umbral Diario de Tweets',
        logModeOveractive: 'Modo: Superactivo',

        // Cooldown
        cooldownNormal: 'Normal',
        cooldownSoft: 'Cooldown suave',
        cooldownRateLimit: 'Rate limit',

        // Refollow
        refollowBtn: 'Reseguir',
        refollowTitle: 'Seguir de nuevo',
        refollowSuccess: '@{username} seguido de nuevo',
        refollowError: 'No se pudo reseguir a @{username}',
        refollowedLabel: 'Reseguido',

        // Tab names
        tabHome: 'Inicio',
        tabLogs: 'Log',
        tabHistory: 'Historial',
        tabSettings: 'Ajustes',

        // Section titles
        sectionMode: 'Modo',
        sectionConfig: 'Configuración',
        sectionGeneral: 'General',
        sectionAppearance: 'Apariencia',

        // Notification permission
        notifPermissionDenied: 'Permiso de notificación denegado',

        // Connection status
        statusNotConnected: 'Content script no conectado. Actualiza la página.',

        // Onboarding
        onboardingTitle: 'Bienvenido a X Unfollow Tool',
        onboardingStep1Title: 'Elige un Modo',
        onboardingStep1Desc: 'Selecciona a quién dejar de seguir: no seguidores, inactivos o filtro de bio.',
        onboardingStep2Title: 'Configura tu Lista Blanca',
        onboardingStep2Desc: 'Agrega nombres de usuario que deseas proteger.',
        onboardingStep3Title: 'Inicia el Proceso',
        onboardingStep3Desc: 'Ve a la página de seguidos en X.com y haz clic en Iniciar.',
        onboardingDone: '¡Entendido!'
    }
};

// i18n object
window.i18n = {
    forcedLang: null,

    getLanguage() {
        if (this.forcedLang) return this.forcedLang;
        const lang = chrome.i18n?.getUILanguage?.() || navigator.language || 'en';
        if (lang.startsWith('tr')) return 'tr';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('pt')) return 'pt';
        if (lang.startsWith('es')) return 'es';
        return 'en';
    },

    translations
};

// Get translation helper
function t(key, params = {}) {
    const lang = window.i18n.getLanguage();
    let text = translations[lang]?.[key] || translations.en[key] || key;

    Object.keys(params).forEach(param => {
        text = text.replaceAll(`{${param}}`, params[param]);
    });

    return text;
}
