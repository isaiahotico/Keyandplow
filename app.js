// --- DATABASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "facebook-follow-to-follow.firebaseapp.com",
    databaseURL: "https://facebook-follow-to-follow-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "facebook-follow-to-follow",
    storageBucket: "facebook-follow-to-follow.firebasestorage.app",
    messagingSenderId: "589427984313",
    appId: "1:589427984313:web:a17b8cc851efde6dd79868"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// --- GLOBAL STATE ---
let dailyAdsCount = 0;
let isLimitlessActive = false;
const USER_ID_KEY = 'ads_app_user_id';
const ADS_STATS_KEY = 'ads_stats';

// --- INITIALIZATION ---
window.onload = () => {
    initUser();
    initClock();
    checkDailyReset();
    
    // 1. Show ad on app open
    triggerRandomInterstitial();
    
    // 2. Setup standard background heartbeat (every 1 min)
    setInterval(() => {
        if (!isLimitlessActive) { // Only run if limitless isn't already spamming
            console.log("Background 1-min heartbeat trigger");
            triggerRandomInterstitial();
        }
    }, 60000);

    // 3. Setup the SDK's internal InApp manager
    show_10555663({
        type: 'inApp',
        inAppSettings: { frequency: 5, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
    });
};

// --- CORE FUNCTIONS ---

function initUser() {
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
        uid = 'ID-' + Math.random().toString(36).substr(2, 7).toUpperCase();
        localStorage.setItem(USER_ID_KEY, uid);
    }
    document.getElementById('userId').innerText = uid;
}

function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('currentTime').innerText = now.toLocaleTimeString([], {hour12: false});
        document.getElementById('currentDate').innerText = now.toDateString();
        
        // Auto-reset check at midnight
        if(now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            resetDailyCount();
        }
    };
    setInterval(update, 1000);
    update();
}

async function triggerRandomInterstitial() {
    const adPool = [show_10555663, show_10555746, show_10555727];
    const pick = adPool[Math.floor(Math.random() * adPool.length)];
    
    try {
        await pick();
        incrementAdsCount();
        return true;
    } catch (e) {        console.warn("Ad skipped or failed");
        return false;
    }
}

function incrementAdsCount() {
    dailyAdsCount++;
    document.getElementById('adsCount').innerText = dailyAdsCount;
    localStorage.setItem(ADS_STATS_KEY, JSON.stringify({
        date: new Date().toDateString(),
        count: dailyAdsCount
    }));
}

function checkDailyReset() {
    const stats = JSON.parse(localStorage.getItem(ADS_STATS_KEY));
    const today = new Date().toDateString();
    if (stats && stats.date === today) {
        dailyAdsCount = stats.count;
    } else {
        dailyAdsCount = 0;
    }
    document.getElementById('adsCount').innerText = dailyAdsCount;
}

function resetDailyCount() {
    dailyAdsCount = 0;
    document.getElementById('adsCount').innerText = "0";
    localStorage.removeItem(ADS_STATS_KEY);
}

// --- NEW LIMITLESS MODE LOGIC ---

async function toggleLimitlessMode() {
    const btn = document.getElementById('btnLimitless');
    const status = document.getElementById('autoStatus');

    if (!isLimitlessActive) {
        // Turn ON
        isLimitlessActive = true;
        btn.innerText = "🛑 STOP LIMITLESS";
        btn.classList.replace('from-indigo-600', 'from-red-600');
        btn.classList.replace('to-blue-600', 'to-red-800');
        status.classList.remove('hidden');
        runLimitlessLoop();
    } else {
        // Turn OFF
        isLimitlessActive = false;
        btn.innerText = "🚀 START LIMITLESS ADS";
        btn.classList.replace('from-red-600', 'from-indigo-600');
        btn.classList.replace('to-red-800', 'to-blue-600');
        status.classList.add('hidden');
    }
}

async function runLimitlessLoop() {
    while (isLimitlessActive) {
        console.log("Limitless Mode: Triggering Ad...");
        const success = await triggerRandomInterstitial();
        
        // Short delay between ads to prevent browser hanging
        // If the ad failed, wait 3 seconds before trying again to avoid spam blocks
        const delay = success ? 1000 : 3000; 
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}
