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

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUID = "";
let dailyCount = 0;

// --- 1. UID & RESET LOGIC ---
function initUser() {
    let id = localStorage.getItem('user_unique_id');
    if (!id) {
        id = 'AD-' + Math.random().toString(36).substr(2, 5).toUpperCase() + '-' + Date.now().toString().slice(-4);
        localStorage.setItem('user_unique_id', id);
    }
    currentUID = id;
    document.getElementById('uid-display').innerText = currentUID;

    // Daily Reset check
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('last_active_date');
    if (lastDate !== today) {
        dailyCount = 0;
        localStorage.setItem('daily_ad_count', 0);
        localStorage.setItem('last_active_date', today);
    } else {
        dailyCount = parseInt(localStorage.getItem('daily_ad_count')) || 0;
    }
    document.getElementById('daily-ads-count').innerText = dailyCount;
}

function incrementCount() {
    dailyCount++;
    localStorage.setItem('daily_ad_count', dailyCount);
    document.getElementById('daily-ads-count').innerText = dailyCount;
    // Firebase Sync
    db.ref('stats/' + currentUID).set({
        count: dailyCount,
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    });
}

// --- 2. IN-APP ADS ENGINE (2 MINUTE COOLDOWN) ---
const inAppConfig = {
    type: 'inApp',
    inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
};

function triggerInAppAds() {
    console.log("Triggering In-App Ad Cycle...");
    // Attempt all 3 zones for In-App coverage
    if(typeof show_10555663 === 'function') show_10555663(inAppConfig);
    if(typeof show_10555746 === 'function') show_10555746(inAppConfig);
    if(typeof show_10555727 === 'function') show_10555727(inAppConfig);
}

function startInAppTimer() {
    let timeLeft = 120;
    setInterval(() => {
        timeLeft--;        document.getElementById('inapp-timer').innerText = timeLeft + "s";
        if (timeLeft <= 0) {
            triggerInAppAds();
            timeLeft = 120;
        }
    }, 1000);
}

// --- 3. REWARDED ENGINE (2S COOLDOWN + BACKUPS) ---
const rewardedZones = [
    { name: 'Primary', call: () => show_10555663() },
    { name: 'Backup 1', call: () => show_10555746() },
    { name: 'Backup 2', call: () => show_10555727() }
];

async function runRewardedLoop() {
    const log = document.getElementById('engine-log');
    const progress = document.getElementById('ad-progress');

    // 2s Cooldown
    log.innerHTML = `<p class="text-[11px] text-yellow-500 italic">Cooldown 2s...</p>`;
    progress.style.width = "0%";
    await new Promise(r => setTimeout(r, 2000));
    
    log.innerHTML = `<p class="text-[11px] text-blue-400 italic">Requesting Ad...</p>`;
    progress.style.width = "100%";

    let success = false;
    // Try Primary then Backups
    for (let zone of rewardedZones) {
        try {
            await zone.call();
            success = true;
            incrementCount();
            break; 
        } catch (e) {
            console.warn(`${zone.name} failed, trying next...`);
        }
    }

    if (!success) {
        log.innerHTML = `<p class="text-[11px] text-red-400 italic">Retrying in 2s...</p>`;
    }

    runRewardedLoop(); // Auto-restart
}

// --- 4. CLOCK ---
function updateClock() {
    const now = new Date();
    document.getElementById('time-display').innerText = now.toLocaleTimeString('en-GB', { hour12: false });
    document.getElementById('date-display').innerText = now.toLocaleDateString('en-GB', { 
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
    });
}

// --- INITIALIZE ---
window.onload = () => {
    initUser();
    setInterval(updateClock, 1000);
    updateClock();

    // Start Engines
    triggerInAppAds(); // Run In-App immediately on open
    startInAppTimer(); // Then every 2 mins
    
    setTimeout(runRewardedLoop, 1000); // Start rewarded loop
};
