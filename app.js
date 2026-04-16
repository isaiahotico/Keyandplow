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

// State Variables
let userId = localStorage.getItem('unique_user_id');
let dailyAdsCount = 0;
let lastResetDate = localStorage.getItem('last_reset_date');
let cooldownTime = 60;

// 1. Generate / Retrieve Unique User ID
if (!userId) {
    userId = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    localStorage.setItem('unique_user_id', userId);
}
document.getElementById('userId').innerText = userId;

// 2. Daily Reset Logic
function checkDailyReset() {
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
        dailyAdsCount = 0;
        localStorage.setItem('last_reset_date', today);
        saveCountToFirebase(0);
        updateUI();
    }
}

// 3. Ad Functions
async function showRandomAd() {
    logStatus("Attempting to show random ad...");
    
    // Array of available ad functions from your SDK
    const adPool = [
        () => show_10555663(),
        () => show_10555746(),
        () => show_10555727(),
        () => show_10555663('pop')
    ];

    const randomIndex = Math.floor(Math.random() * adPool.length);
    
    try {
        await adPool[randomIndex]();
        // Success Logic
        dailyAdsCount++;
        updateUI();
        saveCountToFirebase(dailyAdsCount);
        logStatus("Ad successfully displayed!");
    } catch (error) {
        logStatus("Ad failed or skipped.");
        console.error("Ad Error:", error);
    }
}

// 4. Persistence
function saveCountToFirebase(count) {
    database.ref('users/' + userId).set({
        lastActive: new Date().toISOString(),
        adsPlayedToday: count
    });
}

function updateUI() {
    document.getElementById('adCountDisplay').innerText = dailyAdsCount;
}

function logStatus(msg) {
    const log = document.getElementById('statusLog');
    log.innerHTML += > ${msg}<br>;
    log.scrollTop = log.scrollHeight;
}

// 5. Footer Clock
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();
    document.getElementById('footerDateTime').innerText = ${timeStr} | ${dateStr};
}

// 6. Cooldown Loop (Every 1 minute)
function startCooldown() {
    setInterval(() => {
        cooldownTime--;
        if (cooldownTime <= 0) {
            showRandomAd();
            cooldownTime = 60;
        }
        document.getElementById('nextAdTimer').innerText = Next auto-ad in: ${cooldownTime}s;
    }, 1000);
}

// --- INITIALIZATION ---
window.onload = () => {
    checkDailyReset();
    
    // Sync with Firebase on load
    database.ref('users/' + userId + '/adsPlayedToday').once('value').then((snapshot) => {
        if (snapshot.exists()) {
            dailyAdsCount = snapshot.val();
            updateUI();
        }
    });

    // 1. Limitless Ads on Open (Triggering first batch)
    showRandomAd();

    // 2. In-App Interstitial Config (Auto behavior)
    if (typeof show_10555663 === 'function') {
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

    // Start Clock
    setInterval(updateClock, 1000);
    updateClock();

    // Start 1-minute cooldown loop
    startCooldown();
};
