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

// --- STATE ---
let USER_ID = "";
let ADS_TODAY = 0;

// --- INITIALIZE UNIQUE USER ID ---
function setupUID() {
    let id = localStorage.getItem('app_user_uid');
    if (!id) {
        id = 'UID-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString().slice(-4);
        localStorage.setItem('app_user_uid', id);
    }
    USER_ID = id;
    document.getElementById('uid-field').innerText = USER_ID;
}

// --- DAILY TRACKER & RESET ---
function updateDailyStats() {
    const today = new Date().toLocaleDateString();
    const lastSavedDate = localStorage.getItem('last_ad_date');
    
    if (lastSavedDate !== today) {
        ADS_TODAY = 0;
        localStorage.setItem('last_ad_count', 0);
        localStorage.setItem('last_ad_date', today);
    } else {
        ADS_TODAY = parseInt(localStorage.getItem('last_ad_count')) || 0;
    }
    document.getElementById('counter-main').innerText = ADS_TODAY;
}

function saveAdWin() {
    ADS_TODAY++;
    localStorage.setItem('last_ad_count', ADS_TODAY);
    document.getElementById('counter-main').innerText = ADS_TODAY;
    
    // Sync with Firebase
    database.ref('user_stats/' + USER_ID).update({
        daily_count: ADS_TODAY,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// --- AD ENGINE (WITH BACKUP LOGIC) ---
const adSequence = [
    { id: '10555663', call: () => typeof show_10555663 === 'function' ? show_10555663() : Promise.reject() },
    { id: '10555746', call: () => typeof show_10555746 === 'function' ? show_10555746() : Promise.reject() },
    { id: '10555727', call: () => typeof show_10555727 === 'function' ? show_10555727() : Promise.reject() }
];

async function startAdCycle() {
    const statusText = document.getElementById('engine-status');
    const progressBar = document.getElementById('progress-bar');

    // 1. Cooldown Period (2 seconds)    statusText.innerText = "Cooling down (2s)...";
    statusText.className = "text-xs text-yellow-500 italic";
    progressBar.style.width = "0%";
    
    await new Promise(r => setTimeout(r, 2000));
    
    progressBar.style.width = "100%";
    statusText.innerText = "Requesting Ad...";
    statusText.className = "text-xs text-blue-400 italic";

    // 2. Primary Ad Attempt with 2 Backups
    let adSuccess = false;
    
    // Shuffle the sequence so we don't spam the same zone first every time
    const shuffledAds = [...adSequence].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledAds.length; i++) {
        try {
            statusText.innerText = `Attempting Zone ${shuffledAds[i].id}...`;
            await shuffledAds[i].call();
            adSuccess = true;
            break; // Stop loop if ad shows successfully
        } catch (err) {
            console.warn(`Zone ${shuffledAds[i].id} failed, trying backup...`);
            continue; // Try the next backup
        }
    }

    if (adSuccess) {
        saveAdWin();
    } else {
        statusText.innerText = "All zones exhausted. Retrying...";
    }

    // 3. Restart Cycle Automatically
    startAdCycle();
}

// --- CLOCK COMPONENT ---
function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('clock-time').innerText = now.toLocaleTimeString('en-GB', { hour12: false });
        document.getElementById('clock-date').innerText = now.toLocaleDateString('en-GB', { 
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
        });
    };
    setInterval(update, 1000);
    update();
}

// --- START ---
window.onload = () => {
    setupUID();
    updateDailyStats();
    initClock();
    
    // Initial 1s wait then start the loop
    setTimeout(startAdCycle, 1000);
};
