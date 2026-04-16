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

document.addEventListener('DOMContentLoaded', () => {
    initUserId();
    updateDateTime();
    handleDailyCounter();
    
    // 1. Auto show random interstitial ads when user opens
    showRandomInterstitial();

    // 2. Auto show In-App ads every 1 minute (Cooldown)
    setInterval(() => {
        triggerInAppAd();
    }, 60000); // 60000ms = 1 minute

    // 3. Update time every second
    setInterval(updateDateTime, 1000);
});

// Generate or Retrieve Unique User ID
function initUserId() {
    let uid = localStorage.getItem('app_user_id');
    if (!uid) {
        uid = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('app_user_id', uid);
    }
    document.getElementById('userIdDisplay').innerText = uid;
}

// Daily Ad Counter Logic
function handleDailyCounter() {
    const today = new Date().toDateString();
    let stats = JSON.parse(localStorage.getItem('ad_stats')) || { date: today, count: 0 };

    if (stats.date !== today) {
        stats = { date: today, count: 0 };
    }

    localStorage.setItem('ad_stats', JSON.stringify(stats));
    document.getElementById('adCountDisplay').innerText = stats.count;
}

function incrementAdCount() {
    let stats = JSON.parse(localStorage.getItem('ad_stats'));
    stats.count++;
    localStorage.setItem('ad_stats', JSON.stringify(stats));
    document.getElementById('adCountDisplay').innerText = stats.count;
}

// Footer Date & Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', year: 'numeric', month: 'short', 
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
    };
    document.getElementById('footerDateTime').innerText = now.toLocaleString('en-US', options);
}

// --- AD FUNCTIONS ---

const adFunctions = [show_10555663, show_10555746, show_10555727];

function showRandomInterstitial() {
    // Pick a random function from the array
    const randomIndex = Math.floor(Math.random() * adFunctions.length);
    const selectedAdFunc = adFunctions[randomIndex];

    console.log("Triggering Random Interstitial...");
    
    selectedAdFunc().then(() => {
        incrementAdCount();
        console.log('User has seen an interstitial ad!');
    }).catch(err => {
        console.error("Ad failed or was skipped", err);
    });
}

function triggerInAppAd() {
    console.log("Triggering Cooldown In-App Ad...");
    // Using the specific in-app config requested
    show_10555663({
        type: 'inApp',
        inAppSettings: {
            frequency: 1,      // Show 1 ad
            capping: 0.1,
            interval: 30,
            timeout: 0,        // Show immediately when triggered
            everyPage: false
        }
    });
    incrementAdCount();
}
