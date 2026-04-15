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
let adsPlayedToday = 0;
let cooldownTime = 180; // 3 minutes in seconds
let timerInterval;

// --- TELEGRAM USER LOGIC ---
const tg = window.Telegram.WebApp;
tg.ready();
const username = tg.initDataUnsafe?.user?.username || "Guest_User";
const userId = tg.initDataUnsafe?.user?.id || "anonymous";
document.getElementById('tg-username').innerText = @${username};

// --- CORE FUNCTIONS ---

// 1. Daily Counter & Firebase Sync
function syncAdsCount() {
    const today = new Date().toISOString().split('T')[0];
    const userRef = database.ref('users/' + userId);

    userRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.lastDate === today) {
            adsPlayedToday = data.count || 0;
        } else {
            // New day, reset count
            adsPlayedToday = 0;
            userRef.update({ lastDate: today, count: 0 });
        }
        updateUI();
    });
}

function incrementAds() {
    adsPlayedToday++;
    const today = new Date().toISOString().split('T')[0];
    database.ref('users/' + userId).update({
        count: adsPlayedToday,
        lastDate: today
    });
    updateUI();
}

function updateUI() {
    document.getElementById('ads-count').innerText = adsPlayedToday;
}

// 2. Ad Implementation
function showInterstitial() {
    show_10555663().then(() => {
        incrementAds();
        console.log("Interstitial Ad Viewed");
    }).catch(e => console.error("Ad Error:", e));
}

function triggerManualAd() {
    showInterstitial();
}

// 3. Auto Show In-App Ads Logic (The 3-minute cooldown)
function startCooldown() {
    let current = cooldownTime;
    timerInterval = setInterval(() => {
        current--;
        
        // Update Timer UI
        const mins = Math.floor(current / 60);
        const secs = current % 60;
        document.getElementById('timer').innerText = 
            ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')};
        
        // Update Circular Progress
        const percent = (current / cooldownTime) * 100;
        document.getElementById('progress-bar').setAttribute('stroke-dasharray', ${percent}, 100);

        if (current <= 0) {
            clearInterval(timerInterval);
            // Trigger Auto Ad
            show_10555663('pop').then(() => {
                incrementAds();
                startCooldown(); // Restart cycle
            }).catch(() => {
                startCooldown(); // Restart even if it fails
            });
        }
    }, 1000);
}

// 4. Time and Date Footer
function updateClock() {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleDateString();
    document.getElementById('footer-time').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// --- INITIALIZATION ---

window.onload = () => {
    syncAdsCount();
    updateClock();
    
    // Requirement: Show interstitial ads limitlessly when user opens app
    // Note: Most browsers block more than 1 immediate popup, 
    // but we call it once on load as requested.
    showInterstitial();

    // Start the 3-minute auto-ad cycle
    startCooldown();

    // Initialize the In-App configuration as provided in your instructions
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
};
