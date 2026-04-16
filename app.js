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
const cooldownTime = 1; // 1 Second limit
const adZones = ['10555663', '10555746', '10555727'];
const userId = localStorage.getItem('ad_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('ad_user_id', userId);

// 1. Time & Date (Footer)
function updateClock() {
    const now = new Date();
    document.getElementById('footer-time').innerText = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB', { 
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
    });
}
setInterval(updateClock, 1000);

// 2. Firebase Counter (Daily Reset)
const getTodayKey = () => {
    const d = new Date();
    return ${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()};
};

function syncCounter() {
    const today = getTodayKey();
    db.ref(stats/${userId}/${today}/count).on('value', (snap) => {
        document.getElementById('ads-count').innerText = snap.val() || 0;
    });
}

function incrementCounter() {
    const today = getTodayKey();
    db.ref(stats/${userId}/${today}/count).transaction(c => (c || 0) + 1);
}

// 3. The Random Ad Logic
function triggerRandomAd() {
    // Pick a random Zone ID
    const randomId = adZones[Math.floor(Math.random() * adZones.length)];
    const adFunction = window['show_' + randomId];
    
    document.getElementById('active-zone').innerText = randomId;
    console.log(Triggering Zone: ${randomId});

    if (typeof adFunction === 'function') {
        // Execute the rewarded/interstitial format
        adFunction().then(() => {
            incrementCounter();
            startLoop();
        }).catch(() => {
            // Even on error, keep the limitless loop going
            startLoop();
        });
    } else {
        startLoop();
    }
}

// 4. Limitless 1-Second Loop
function startLoop() {
    let timeLeft = cooldownTime;
    const progress = document.getElementById('progress-bar');
    
    const timer = setInterval(() => {
        timeLeft -= 0.1;
        const width = (1 - timeLeft / cooldownTime) * 100;
        progress.style.width = ${width}%;

        if (timeLeft <= 0) {
            clearInterval(timer);
            progress.style.width = '0%';
            triggerRandomAd();
        }
    }, 100);
}

// 5. In-App Ads (Randomized Initialization)
function initInAppAds() {
    // Initialize all 3 zones for In-App to maximize exposure
    adZones.forEach(zoneId => {
        const initFn = window['show_' + zoneId];
        if (typeof initFn === 'function') {
            initFn({
                type: 'inApp',
                inAppSettings: {
                    frequency: 1,      // Show every time possible
                    capping: 0.01,     // Almost no capping (less than a minute)
                    interval: 1,       // 1 second between in-app ads
                    timeout: 0,        // 0 delay
                    everyPage: true    // Reset on every navigation/refresh
                }
            });
        }
    });
}

// Initialize on Load
window.onload = () => {
    updateClock();
    syncCounter();
    initInAppAds();
    
    // Initial start
    setTimeout(() => {
        triggerRandomAd();
    }, 1500);
};
