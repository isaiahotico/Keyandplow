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
const database = firebase.database();

// --- STATE MANAGEMENT ---
let dailyAdsCount = 0;
const USER_ID_KEY = 'ads_app_user_id';
const ADS_STATS_KEY = 'ads_stats';

// --- INITIALIZATION ---
window.onload = () => {
    initUser();
    initClock();
    checkDailyReset();
    
    // 1. Auto-show random interstitial ads limitlessly when user opens app
    triggerRandomInterstitial();
    
    // 2. Setup In-App ads with 1 minute interval (as per request)
    setupInAppAds();
};

// --- USER ID LOGIC ---
function initUser() {
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
        uid = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem(USER_ID_KEY, uid);
    }
    document.getElementById('userId').innerText = uid;
}

// --- CLOCK LOGIC ---
function initClock() {
    const updateClock = () => {
        const now = new Date();
        document.getElementById('currentTime').innerText = now.toLocaleTimeString();
        document.getElementById('currentDate').innerText = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        // Auto-reset check every second
        if(now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            resetDailyCount();
        }
    };
    setInterval(updateClock, 1000);
    updateClock();
}

// --- ADS LOGIC ---

function incrementAdsCount() {
    dailyAdsCount++;
    document.getElementById('adsCount').innerText = dailyAdsCount;
    
    // Save to local storage
    const today = new Date().toDateString();
    localStorage.setItem(ADS_STATS_KEY, JSON.stringify({
        date: today,
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

// Function to call random interstitial ads
async function triggerRandomInterstitial() {
    const adFunctions = [show_10555663, show_10555746, show_10555727];
    const randomIndex = Math.floor(Math.random() * adFunctions.length);
    const selectedAd = adFunctions[randomIndex];

    try {
        if (typeof selectedAd === 'function') {
            await selectedAd();
            incrementAdsCount();
        }
    } catch (e) {
        console.error("Ad failed to load", e);
    }
}

// Setup In-App Ads every 1 minute
function setupInAppAds() {
    // Calling the SDK's internal auto-manager
    show_10555663({
        type: 'inApp',
        inAppSettings: {
            frequency: 999, // High frequency for "limitless" feel
            capping: 0.01,   
            interval: 60,   // 60 seconds (1 minute) cooldown
            timeout: 5,
            everyPage: false
        }
    });

    // Manual backup interval to ensure ad count updates and visibility
    setInterval(() => {
        triggerRandomInterstitial();
    }, 60000); // 1 minute
}
