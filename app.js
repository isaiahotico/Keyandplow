import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "facebook-follow-to-follow.firebaseapp.com",
    databaseURL: "https://facebook-follow-to-follow-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "facebook-follow-to-follow",
    storageBucket: "facebook-follow-to-follow.firebasestorage.app",
    messagingSenderId: "589427984313",
    appId: "1:589427984313:web:a17b8cc851efde6dd79868"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateClock();
    setInterval(updateClock, 1000);
    
    // 1. START IN-APP ADS IMMEDIATELY (Based on your config)
    startInAppAds();

    // 2. START AUTO REWARDED ADS LOOP
    // First ad shows after 1 second fast
    setTimeout(showRandomRewardedAd, 1000); 
    
    // Then continues every 2 minutes (120,000 ms)
    setInterval(showRandomRewardedAd, 120000);
});

function initApp() {
    let uid = localStorage.getItem('adApp_uid');
    if (!uid) {
        uid = 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('adApp_uid', uid);
    }
    document.getElementById('userId').innerText = uid;

    checkDailyReset();
    updateDisplayCount();
}

function startInAppAds() {
    try {
        show_10555663({
            type: 'inApp',
            inAppSettings: {
                frequency: 2,
                capping: 0.1,
                interval: 30,
                timeout: 5,
                everyPage: false
            }
        });
        console.log("In-App Engine Started");
    } catch (e) {
        console.error("In-App Ad Failed:", e);
    }
}

async function showRandomRewardedAd() {
    const status = document.getElementById('status');
    status.innerHTML = <span class="text-yellow-500 italic text-xs">Launching auto-reward ad...</span>;

    const adPool = [
        () => show_10555663(),
        () => show_10555746(),
        () => show_10555727(),
        () => show_10555663('pop')
    ];

    const randomIndex = Math.floor(Math.random() * adPool.length);
    const selectedAdFunc = adPool[randomIndex];

    try {
        await selectedAdFunc();
        status.innerHTML = <span class="text-emerald-500 font-bold tracking-widest text-xs">AD COMPLETE ✓</span>;
        incrementCount();
    } catch (error) {
        status.innerHTML = <span class="text-red-400 text-xs">Engine busy or ad blocked...</span>;
        console.warn("Auto-ad error:", error);
    }
}

// --- UTILITY FUNCTIONS ---

function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    document.getElementById('footerDate').innerText = now.toLocaleDateString('en-US', options);
    document.getElementById('footerTime').innerText = now.toLocaleTimeString();
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('adApp_lastDate');
    if (lastDate !== today) {
        localStorage.setItem('adApp_lastDate', today);
        localStorage.setItem('adApp_count', '0');
    }
}

function updateDisplayCount() {
    const count = localStorage.getItem('adApp_count') || 0;
    document.getElementById('adCount').innerText = count;
}

async function incrementCount() {
    let count = parseInt(localStorage.getItem('adApp_count') || 0);
    count++;
    localStorage.setItem('adApp_count', count);
    updateDisplayCount();

    const uid = localStorage.getItem('adApp_uid');
    const userRef = ref(db, 'users/' + uid);
    try {
        await update(userRef, {
            last_activity: new Date().toISOString(),
            daily_total: count
        });
    } catch (e) { console.error("DB Sync Error", e); }
}
