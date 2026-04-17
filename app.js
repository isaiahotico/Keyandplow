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
const db = firebase.database();

// --- GLOBALS ---
let userId = "";
let dailyCount = 0;

// --- FIX: UID LOADING & RETENTION ---
const initializeUser = () => {
    let storedId = localStorage.getItem('ads_app_uid');
    if (!storedId) {
        // Generate a clean unique ID
        storedId = 'ID-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Date.now().toString().slice(-4);
        localStorage.setItem('ads_app_uid', storedId);
    }
    userId = storedId;
    document.getElementById('uid-display').innerText = userId;
};

// --- DAILY RESET LOGIC ---
const handleDailyReset = () => {
    const today = new Date().toDateString(); // e.g. "Fri Apr 17 2026"
    const lastDate = localStorage.getItem('ads_app_last_date');

    if (lastDate !== today) {
        dailyCount = 0;
        localStorage.setItem('ads_app_count', 0);
        localStorage.setItem('ads_app_last_date', today);
    } else {
        dailyCount = parseInt(localStorage.getItem('ads_app_count')) || 0;
    }
    document.getElementById('daily-count').innerText = dailyCount;
};

const incrementAdCount = () => {
    dailyCount++;
    localStorage.setItem('ads_app_count', dailyCount);
    document.getElementById('daily-count').innerText = dailyCount;
    
    // Update Firebase
    db.ref('stats/' + userId).set({
        total_watched: dailyCount,
        last_updated: firebase.database.ServerValue.TIMESTAMP
    });
};

// --- AUTO AD ENGINE ---
const adZones = [
    () => show_10555663(),
    () => show_10555746(),
    () => show_10555727(),
    () => show_10555663('pop')
];

async function runAdCycle() {
    const statusLabel = document.getElementById('ad-status');
    
    // 2-Second Cooldown
    statusLabel.innerText = "Cooldown (2s)...";
    statusLabel.classList.replace('text-green-400', 'text-yellow-400');
    
    setTimeout(async () => {
        statusLabel.innerText = "Requesting Ad...";
        statusLabel.classList.replace('text-yellow-400', 'text-blue-400');

        try {
            // Pick random ad from your functions
            const randomIdx = Math.floor(Math.random() * adZones.length);
            await adZones[randomIdx]();
            
            // On Ad Success
            incrementAdCount();
            console.log("Ad completed successfully.");
        } catch (e) {
            console.warn("Ad skip or error:", e);
        }

        // Loop immediately (the 2s cooldown happens at start of next cycle)
        runAdCycle();
    }, 2000);
}

// --- FOOTER TIME & DATE ---
const startClock = () => {
    const update = () => {
        const now = new Date();
        document.getElementById('footer-time').innerText = now.toLocaleTimeString('en-US', { hour12: false });
        document.getElementById('footer-date').innerText = now.toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
        });
    };
    setInterval(update, 1000);
    update();
};

// --- START APP ---
window.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    handleDailyReset();
    startClock();
    
    // Initial delay before first ad starts
    setTimeout(runAdCycle, 1000);
});
