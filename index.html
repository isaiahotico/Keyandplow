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

// --- APP LOGIC ---

let dailyAdCount = 0;
let cooldownSeconds = 60;
const COOLDOWN_TIME = 60; // 1 minute

// 1. Generate or Get Unique User ID
function getUserId() {
    let uid = localStorage.getItem('unique_user_id');
    if (!uid) {
        uid = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('unique_user_id', uid);
    }
    return uid;
}

// 2. Daily Counter Management
function checkDailyReset() {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('last_ad_date');
    
    if (lastDate !== today) {
        localStorage.setItem('last_ad_date', today);
        localStorage.setItem('daily_ad_count', 0);
        dailyAdCount = 0;
    } else {
        dailyAdCount = parseInt(localStorage.getItem('daily_ad_count')) || 0;
    }
    updateUI();
}

function incrementAdCount() {
    dailyAdCount++;
    localStorage.setItem('daily_ad_count', dailyAdCount);
    updateUI();
}

// 3. UI Update Logic
function updateUI() {
    document.getElementById('user-id').innerText = getUserId();
    document.getElementById('ad-count').innerText = dailyAdCount;
}

// 4. Random Ad Logic
async function triggerRandomAd() {
    const adPool = [
        () => show_10555663(),
        () => show_10555746(),
        () => show_10555727(),
        () => show_10555663('pop')
    ];

    const randomIndex = Math.floor(Math.random() * adPool.length);
    
    try {
        await adPool[randomIndex]();
        incrementAdCount();
        console.log("Ad successfully shown");
    } catch (error) {
        console.error("Ad failed to load", error);
    }
    
    // Reset Cooldown after any ad (auto or manual)
    cooldownSeconds = COOLDOWN_TIME;
}

// 5. Timers & Cooldown
function startTimers() {
    // Clock & Footer Date
    setInterval(() => {
        const now = new Date();
        document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric' 
        });
        document.getElementById('footer-time').innerText = now.toLocaleTimeString();
    }, 1000);

    // Ad Cooldown Interval
    setInterval(() => {
        cooldownSeconds--;
        
        // Update Progress Bar
        const percentage = (cooldownSeconds / COOLDOWN_TIME) * 100;
        document.getElementById('cooldown-progress').style.width = percentage + "%";
        document.getElementById('cooldown-timer').innerText = cooldownSeconds + "s";

        if (cooldownSeconds <= 0) {
            triggerRandomAd();
            cooldownSeconds = COOLDOWN_TIME; // Reset
        }
    }, 1000);
}

// 6. Initialize In-App Settings (from your SDK snippet)
function initInAppAds() {
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
}

// 7. On App Open
window.onload = () => {
    checkDailyReset();
    startTimers();
    initInAppAds();
    
    // Show first random ad automatically on open
    setTimeout(() => {
        triggerRandomAd();
    }, 2000); // 2 second delay after load
};
