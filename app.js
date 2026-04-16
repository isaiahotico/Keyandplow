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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- USER & STATE MANAGEMENT ---
const getUID = () => {
    let id = localStorage.getItem('_app_uid');
    if(!id) {
        id = 'ID-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem('_app_uid', id);
    }
    return id;
};

const USER_ID = getUID();
let interstitialCount = 0;
let cooldown = 60;
let engineStarted = false;

// --- AD SDK HANDLERS ---
// We only trigger 'increment' for Interstitials and Popups
const triggerAd = (type) => {
    console.log(`System: Triggering ${type}`);
    
    if (type === 'interstitial') {
        // Randomly pick one of the three interstitial-capable zones
        const zones = [show_10555663, show_10555746, show_10555727];
        const picker = Math.floor(Math.random() * zones.length);
        
        zones[picker]().then(() => countAd()).catch(() => countAd());
    } 
    
    else if (type === 'popup') {
        show_10555663('pop').then(() => countAd()).catch(() => countAd());
    }

    else if (type === 'inApp') {
        show_10555663({
            type: 'inApp',
            inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
        }).then(() => countAd()).catch(() => countAd());
    }
};

const countAd = () => {
    interstitialCount++;
    updateUI();
    saveToFirebase();
};

// --- DATA LOGIC ---
const saveToFirebase = () => {
    const today = new Date().toISOString().split('T')[0];
    db.ref(`analytics/users/${USER_ID}/${today}`).set(interstitialCount);
};

const dailyResetCheck = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('_last_run');
    
    document.getElementById('display-uid').innerText = USER_ID;
    document.getElementById('current-date').innerText = today;

    if (savedDate !== today) {
        interstitialCount = 0;
        localStorage.setItem('_last_run', today);        saveToFirebase();
    } else {
        db.ref(`analytics/users/${USER_ID}/${today}`).once('value', (snap) => {
            interstitialCount = snap.val() || 0;
            updateUI();
        });
    }
};

const updateUI = () => {
    document.getElementById('ad-count').innerText = interstitialCount;
    document.getElementById('display-verified').innerText = interstitialCount;
};

// --- AUTOMATION LOOPS ---
const runEngine = () => {
    if(engineStarted) return;
    engineStarted = true;
    
    document.getElementById('unlock-layer').style.display = 'none';
    document.getElementById('status-tag').innerText = "ENGINE RUNNING";
    document.getElementById('status-tag').classList.add('text-blue-500');

    // 1. LIMITLESS RANDOM LOOP (Every 22 seconds)
    // Randomly switches between Interstitial and Popup formats
    setInterval(() => {
        const adType = Math.random() > 0.5 ? 'interstitial' : 'popup';
        triggerAd(adType);
    }, 22000);

    // 2. 1-MINUTE COOLDOWN (Specific In-App Interstitial)
    setInterval(() => {
        cooldown--;
        const percent = ((60 - cooldown) / 60) * 100;
        document.getElementById('progress-bar').style.width = percent + "%";
        document.getElementById('cooldown-timer').innerText = cooldown + "s";

        if(cooldown <= 0) {
            triggerAd('inApp');
            cooldown = 60;
        }
    }, 1000);

    // Immediate start
    triggerAd('interstitial');
};

// Clock
setInterval(() => {
    document.getElementById('footer-time').innerText = new Date().toLocaleTimeString();
}, 1000);

// Initialize
window.onload = () => {
    dailyResetCheck();
    document.getElementById('unlock-layer').addEventListener('click', runEngine);
};
