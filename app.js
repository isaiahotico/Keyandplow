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

// --- STATE MANAGEMENT ---
let adCounter = 0;
let nextAdIn = 1;

// --- UTILS ---
const updateAdDisplay = () => {
    document.getElementById('ad-count').innerText = adCounter;
};

const updateDateTime = () => {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleString();
};

// --- DAILY RESET LOGIC ---
const checkDailyReset = () => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('last_ad_date');

    if (lastDate !== today) {
        adCounter = 0;
        localStorage.setItem('last_ad_date', today);
        saveCounterToDB(0);
    } else {
        // Load from LocalStorage or Firebase
        const savedCount = localStorage.getItem('ad_count');
        adCounter = savedCount ? parseInt(savedCount) : 0;
    }
    updateAdDisplay();
};

const incrementAdCount = () => {
    adCounter++;
    localStorage.setItem('ad_count', adCounter);
    updateAdDisplay();
    saveCounterToDB(adCounter);
};

const saveCounterToDB = (count) => {
    db.ref('stats/dailyCount').set(count);
};

// --- AD TRIGGER LOGIC ---
const showRandomAd = () => {
    const adSelectors = [
        () => show_10555663(),
        () => show_10555663('pop'),
        () => show_10555746(),
        () => show_10555727(),
        () => show_10555663({
            type: 'inApp',
            inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
        })
    ];

    const randomIdx = Math.floor(Math.random() * adSelectors.length);
    console.log(`Triggering Ad variation #${randomIdx}`);

    try {
        adSelectors[randomIdx]().then(() => {
            incrementAdCount();
        }).catch(e => console.log("Ad skipped or blocked"));
    } catch (err) {
        console.error("Ad SDK error", err);
    }
};

// Limitless auto-show on open (initial burst)
const initialBurst = () => {
    let count = 0;
    const burstInterval = setInterval(() => {
        showRandomAd();
        count++;
        if (count >= 5) clearInterval(burstInterval); // Limit burst to 5 to avoid browser crash
    }, 2000);
};

// Manual button trigger
const manualTrigger = () => {
    showRandomAd();
};

// --- TIMERS ---
// Footer clock
setInterval(updateDateTime, 1000);

// 1 Minute Cooldown Loop
setInterval(() => {
    nextAdIn--;
    if (nextAdIn <= 0) {
        showRandomAd();
        nextAdIn = 60;
    }
    document.getElementById('cooldown-timer').innerText = nextAdIn + "s";
}, 1000);

// --- INITIALIZE ---
window.onload = () => {
    updateDateTime();
    checkDailyReset();
    initialBurst(); // Auto-show on open
};
