// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "facebook-follow-to-follow.firebaseapp.com",
    databaseURL: "https://facebook-follow-to-follow-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "facebook-follow-to-follow",
    storageBucket: "facebook-follow-to-follow.firebasestorage.app",
    messagingSenderId: "589427984313",
    appId: "1:589427984313:web:a17b8cc851efde6dd79868"
};

firebase.initializeApp(firebaseConfig);

let dailyAdsCount = 0;
let isLimitlessActive = false;
const USER_ID_KEY = 'ads_app_uid';
const STATS_KEY = 'ads_stats_data';

// --- LOGGING UTILITY ---
function log(msg) {
    const el = document.getElementById('debugLog');
    el.innerHTML = `> ${msg}<br>${el.innerHTML}`;
    console.log(msg);
}

// --- INITIALIZE ---
window.onload = () => {
    initUser();
    initClock();
    checkDailyReset();
    
    // Auto show first ad after 3 seconds
    setTimeout(() => {
        log("Auto-start ad triggered...");
        triggerRandomAd();
    }, 3000);

    // 1 Minute Cooldown Auto-Ad Heartbeat
    setInterval(() => {
        if (!isLimitlessActive) {
            log("1-minute cooldown reached. Showing Ad.");
            triggerRandomAd();
        }
    }, 60000);
};

function initUser() {
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
        uid = 'USER-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem(USER_ID_KEY, uid);
    }
    document.getElementById('userId').innerText = uid;
}

function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('currentTime').innerText = now.toLocaleTimeString([], {hour12: false});
        document.getElementById('currentDate').innerText = now.toDateString().toUpperCase();
        
        if(now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            resetCount();
        }
    }, 1000);
}

// --- ADS ENGINE ---

async function triggerRandomAd() {
    // List of functions provided by your SDK scripts
    const adMethods = [
        { name: 'Zone 5663', func: typeof show_10555663 !== 'undefined' ? show_10555663 : null },
        { name: 'Zone 5746', func: typeof show_10555746 !== 'undefined' ? show_10555746 : null },
        { name: 'Zone 5727', func: typeof show_10555727 !== 'undefined' ? show_10555727 : null }
    ];

    // Filter only those that loaded correctly    const availableAds = adMethods.filter(a => a.func !== null);

    if (availableAds.length === 0) {
        log("<span class='text-red-500'>ERROR: SDK NOT LOADED. Check Internet or AdBlocker.</span>");
        return false;
    }

    const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
    log(`Calling ${randomAd.name}...`);

    try {
        // Execute the SDK function
        await randomAd.func();
        
        // If it succeeds or closes
        updateCount();
        log(`<span class='text-blue-400'>Ad Finished Successfully.</span>`);
        return true;
    } catch (err) {
        log(`<span class='text-yellow-500'>Ad Blocked or Skipped.</span>`);
        return false;
    }
}

function updateCount() {
    dailyAdsCount++;
    document.getElementById('adsCount').innerText = dailyAdsCount;
    localStorage.setItem(STATS_KEY, JSON.stringify({
        day: new Date().toDateString(),
        val: dailyAdsCount
    }));
}

function checkDailyReset() {
    const data = JSON.parse(localStorage.getItem(STATS_KEY));
    const today = new Date().toDateString();
    if (data && data.day === today) {
        dailyAdsCount = data.val;
    } else {
        dailyAdsCount = 0;
    }
    document.getElementById('adsCount').innerText = dailyAdsCount;
}

function resetCount() {
    dailyAdsCount = 0;
    document.getElementById('adsCount').innerText = "0";
    localStorage.removeItem(STATS_KEY);
}

// --- LIMITLESS MODE ---

async function toggleLimitlessMode() {
    const btn = document.getElementById('btnLimitless');
    
    if (!isLimitlessActive) {
        isLimitlessActive = true;
        btn.innerText = "STOP LIMITLESS";
        btn.classList.add('pulse-red');
        btn.classList.replace('from-orange-500', 'from-black');
        btn.classList.replace('to-pink-600', 'to-red-900');
        log("LIMITLESS MODE ON");
        startLoop();
    } else {
        isLimitlessActive = false;
        btn.innerText = "START UNLIMITED ADS";
        btn.classList.remove('pulse-red');
        btn.classList.replace('from-black', 'from-orange-500');
        btn.classList.replace('to-red-900', 'to-pink-600');
        log("LIMITLESS MODE OFF");
    }
}

async function startLoop() {
    while (isLimitlessActive) {
        const success = await triggerRandomAd();
        // Wait 2 seconds before the next ad to prevent browser freezing
        // If the ad was blocked, wait 5 seconds before retrying
        const waitTime = success ? 2000 : 5000;
        await new Promise(r => setTimeout(r, waitTime));
    }
}
