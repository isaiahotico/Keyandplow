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

// --- UNIQUE USER IDENTIFICATION ---
const getUserId = () => {
    let uid = localStorage.getItem('app_user_id');
    if (!uid) {
        // Generate a unique ID (Format: USR-XXXX-XXXX)
        uid = 'USR-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        localStorage.setItem('app_user_id', uid);
    }
    return uid;
};

const USER_ID = getUserId();
let adCounter = 0;
let cooldownSeconds = 60;
let isStarted = false;

// --- AD VARIATIONS ---
const adFunctions = [
    () => show_10555663(), // Standard
    () => show_10555663('pop'), // Popup
    () => show_10555746(), // Reward 1
    () => show_10555727(), // Reward 2
    () => show_10555663({ // InApp specific
        type: 'inApp',
        inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
    })
];

// --- LOGIC ---

const updateStats = () => {
    adCounter++;
    
    // Update Local UI
    document.getElementById('ad-count').innerText = adCounter;
    document.getElementById('display-total').innerText = adCounter;

    // Save to Firebase under specific User ID
    const today = new Date().toISOString().split('T')[0];
    db.ref(`users/${USER_ID}/${today}`).set(adCounter);
};

const checkDailyReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('last_reset_date');
    
    if (lastDate !== today) {
        adCounter = 0;
        localStorage.setItem('last_reset_date', today);
        db.ref(`users/${USER_ID}/${today}`).set(0);
    } else {
        // Fetch current count for user from Firebase
        db.ref(`users/${USER_ID}/${today}`).once('value').then((snapshot) => {
            adCounter = snapshot.val() || 0;
            document.getElementById('ad-count').innerText = adCounter;            document.getElementById('display-total').innerText = adCounter;
        });
    }
    document.getElementById('display-uid').innerText = USER_ID;
};

const triggerRandomAd = () => {
    const idx = Math.floor(Math.random() * adFunctions.length);
    console.log(`[${USER_ID}] Triggering Ad #${idx}`);
    
    try {
        adFunctions[idx]().then(() => updateStats()).catch(() => updateStats());
    } catch(e) {
        updateStats(); // Increment anyway for the attempt
    }
};

const updateClock = () => {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleString();
};

// --- AUTOMATION ENGINE ---

const startEngine = () => {
    if (isStarted) return;
    isStarted = true;
    document.getElementById('unlock-layer').style.display = 'none';
    document.getElementById('connection-status').innerText = "LIVE: SYNCED";
    document.getElementById('connection-status').classList.replace('text-slate-500', 'text-green-500');

    // 1. LIMITLESS LOOP (Every 25 seconds)
    setInterval(() => {
        triggerRandomAd();
    }, 25000);

    // 2. 1-MINUTE COOLDOWN LOOP
    setInterval(() => {
        cooldownSeconds--;
        
        // Update Progress Bar
        const progress = ((60 - cooldownSeconds) / 60) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('cooldown-timer').innerText = `${cooldownSeconds}s`;

        if (cooldownSeconds <= 0) {
            adFunctions[4](); // Trigger In-App Specifically
            updateStats();
            cooldownSeconds = 60;
        }
    }, 1000);

    // Start immediate ad
    triggerRandomAd();
};

// --- INIT ---
window.onload = () => {
    checkDailyReset();
    setInterval(updateClock, 1000);
    document.getElementById('unlock-layer').addEventListener('click', startEngine);
};
