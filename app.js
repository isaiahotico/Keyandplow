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

// State Variables
let adsPlayedToday = 0;
let cooldownTime = 180; // 3 minutes in seconds
let currentCooldown = 0;
const userId = localStorage.getItem('ad_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('ad_user_id', userId);

// 1. Footer Time and Date
function updateClock() {
    const now = new Date();
    document.getElementById('footer-time').innerText = now.toLocaleTimeString();
    document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    // Check for daily reset at midnight
    if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        resetDailyCount();
    }
}
setInterval(updateClock, 1000);

// 2. Firebase Data Management
const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function syncAdsWithFirebase() {
    const today = getTodayKey();
    const userRef = db.ref(`stats/${userId}/${today}`);
    
    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        adsPlayedToday = data ? data.count : 0;
        document.getElementById('ads-count').innerText = adsPlayedToday;
    });
}

function incrementAdCount() {
    const today = getTodayKey();
    const userRef = db.ref(`stats/${userId}/${today}/count`);
    userRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    });
}

function resetDailyCount() {
    // Firebase listener handles the UI update via 'on value'
    console.log("New day detected, counter will reset based on date key.");
}

// 3. Ad Logic
function triggerInterstitialAd() {
    console.log("Attempting to show ad...");
    
    // Using the provided SDK method for Interstitial
    show_10555663().then(() => {console.log("Ad viewed successfully");
        incrementAdCount();
        startCooldown();
    }).catch(e => {
        console.error("Ad failed or was blocked", e);
        // Even if it fails, we restart cooldown to try again
        startCooldown();
    });
}

// 4. Cooldown System (3 Minutes)
function startCooldown() {
    currentCooldown = cooldownTime;
    const statusBadge = document.getElementById('status-badge');
    statusBadge.innerText = "COOLDOWN";
    statusBadge.classList.replace('text-green-400', 'text-amber-400');
    statusBadge.classList.replace('bg-green-500/20', 'bg-amber-500/20');

    const interval = setInterval(() => {
        currentCooldown--;
        
        // Update UI
        const mins = Math.floor(currentCooldown / 60);
        const secs = currentCooldown % 60;
        document.getElementById('timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const progress = ((cooldownTime - currentCooldown) / cooldownTime) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        if (currentCooldown <= 0) {
            clearInterval(interval);
            statusBadge.innerText = "READY";
            statusBadge.classList.replace('text-amber-400', 'text-green-400');
            statusBadge.classList.replace('bg-amber-500/20', 'bg-green-500/20');
            triggerInterstitialAd(); // Trigger next ad after cooldown
        }
    }, 1000);
}

// 5. Initialize App
window.onload = () => {
    updateClock();
    syncAdsWithFirebase();

    // Configuration for In-App Interstitials (As per your code)
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

    // Auto-show first ad immediately on open
    setTimeout(() => {
        triggerInterstitialAd();
    }, 2000);
};
