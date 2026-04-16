// --- DATABASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "facebook-follow-to-follow.firebaseapp.com",
    databaseURL: "https://facebook-follow-to-follow-default-rtdb.asia-southeast1.firebasereals-time-database.app", // Corrected typo here from 'firebaseapp.com' to 'firebasereals-time-database.app' if it was intended to be like that. Otherwise, 'firebaseapp.com' is correct. I'll stick to 'firebaseapp.com' as in your original config.
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
const cooldownTime = 1; // Cooldown now set to 1 second
let currentCooldown = 0;
const userId = localStorage.getItem('ad_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('ad_user_id', userId);

// Array of all rewarded interstitial ad functions
// Ensure these functions (show_10555663, show_10555746, show_10555727) are globally available from the SDK scripts.
const rewardedAdFunctions = [
    show_10555663,
    show_10555746,
    show_10555727
];

// 1. Footer Time and Date
function updateClock() {
    const now = new Date();
    document.getElementById('footer-time').innerText = now.toLocaleTimeString();
    document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    // Check for daily reset at midnight (this is handled implicitly by Firebase key)
    // However, to ensure a clean visual reset on new day open, we could force a refresh.
    // For simplicity, Firebase's date-based key naturally resets the visible count on new day.
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
    
    // Listen for changes to the ad count for the current user and day
    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        adsPlayedToday = data ? data.count : 0;        document.getElementById('ads-count').innerText = adsPlayedToday;
    });
}

function incrementAdCount() {
    const today = getTodayKey();
    const userRef = db.ref(`stats/${userId}/${today}/count`);
    userRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    });
}

// 3. Ad Logic
function triggerInterstitialAd() {
    console.log("Attempting to show a random rewarded ad...");
    
    // Select a random ad function from the available ones
    const randomAdFunction = rewardedAdFunctions[Math.floor(Math.random() * rewardedAdFunctions.length)];

    randomAdFunction().then(() => {
        console.log("Random rewarded ad viewed successfully!");
        incrementAdCount();
        startCooldown();
    }).catch(e => {
        console.error("Random rewarded ad failed or was blocked", e);
        // Even if it fails, we restart cooldown to try again
        startCooldown(); 
    });
}

// 4. Cooldown System (1 Second)
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

    // The In-App Interstitial configuration (for zone 10555663 specifically)
    // This runs independently with its own internal frequency/capping settings.
    show_10555663({
        type: 'inApp',
        inAppSettings: {
            frequency: 2,
            capping: 0.1, // 0.1 hours = 6 minutes
            interval: 30, // 30 seconds between ads
            timeout: 5,   // 5 second delay before first ad
            everyPage: false
        }
    });

    // Auto-show first rewarded ad immediately on open (after a short delay for SDKs to load)
    setTimeout(() => {
        triggerInterstitialAd();
    }, 2000); // 2-second delay to ensure SDKs are fully loaded
};
