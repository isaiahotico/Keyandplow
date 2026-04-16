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

// --- STATE ---
let adCounter = 0;
let cooldownSeconds = 1;
let isRunning = false;

// --- AD LOGIC WRAPPERS ---
const adFunctions = [
    () => show_10555663(), // Standard
    () => show_10555663('pop'), // Popup
    () => show_10555746(), // Reward 1
    () => show_10555727(), // Reward 2
    () => show_10555663({ // InApp Settings
        type: 'inApp',
        inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
    })
];

const triggerRandomAd = () => {
    const randomIdx = Math.floor(Math.random() * adFunctions.length);
    console.log(`System: Triggering Ad Variation ${randomIdx}`);
    
    adFunctions[randomIdx]().then(() => {
        updateStats();
    }).catch(e => {
        // Many ads count as "shown" even if errored or closed
        updateStats(); 
    });
};

// --- CORE FUNCTIONS ---
const updateStats = () => {
    adCounter++;
    document.getElementById('ad-count').innerText = adCounter;
    localStorage.setItem('ad_count_today', adCounter);
    db.ref('stats/dailyCount').set(adCounter);
};

const checkDailyReset = () => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('last_reset_date');
    
    if (lastDate !== today) {
        adCounter = 0;
        localStorage.setItem('last_reset_date', today);
        localStorage.setItem('ad_count_today', 0);
        db.ref('stats/dailyCount').set(0);
    } else {
        adCounter = parseInt(localStorage.getItem('ad_count_today')) || 0;
    }
    document.getElementById('ad-count').innerText = adCounter;
};

const updateClock = () => {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleString();
};

// --- AUTOMATION LOOPS ---

const startAutomation = () => {
    if (isRunning) return;
    isRunning = true;
    document.getElementById('unlock-layer').style.display = 'none';

    // 1. "Limitless" Loop - Triggers a random ad every 20 seconds indefinitely
    setInterval(() => {
        triggerRandomAd();
    }, 20000); 

    // 2. Cooldown Loop - 1 minute countdown for In-App specific trigger
    setInterval(() => {
        cooldownSeconds--;
        
        // Update UI
        const progress = ((1 - cooldownSeconds) / 60) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('cooldown-timer').innerText = `${cooldownSeconds}s`;

        if (cooldownSeconds <= 0) {
            // Trigger the In-App specific ad
            adFunctions[4](); 
            updateStats();
            cooldownSeconds = 60;
        }
    }, 1000);

    // Initial Trigger on start
    triggerRandomAd();
};

// --- INITIALIZE ---
window.onload = () => {
    checkDailyReset();
    setInterval(updateClock, 1000);

    // Modern browsers block automatic ads until first click
    document.getElementById('unlock-layer').addEventListener('click', startAutomation);
};
