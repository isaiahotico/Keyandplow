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

// ================= TELEGRAM (IMMEDIATE DISPLAY) =================
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand(); // Expand the app for full view

const tgUser = tg?.initDataUnsafe?.user;
// Ensure @ symbol for username, else first name, else ID
const username = tgUser 
    ? (tgUser.username ? @${tgUser.username} : tgUser.first_name) 
    : "Anonymous_User";

// Display immediately
document.getElementById("userBar").innerText = "👤 User: " + username;

// Unique ID for Database
const userId = tgUser?.id || "web_user_" + Math.floor(Math.random() * 1000);

// --- APP STATE ---
let adsPlayedToday = 0;
let cooldownTime = 180; // 3 Minutes
let currentCooldown = cooldownTime;

// --- DAILY COUNTER & SYNC ---
function syncAdsData() {
    const today = new Date().toISOString().split('T')[0];
    const userRef = database.ref('users/' + userId);

    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.lastDate === today) {
            adsPlayedToday = data.count || 0;
        } else {
            // New day or new user, reset
            adsPlayedToday = 0;
            userRef.update({ lastDate: today, count: 0 });
        }
        document.getElementById('ads-count').innerText = adsPlayedToday;
    });
}

function incrementAdCounter() {
    adsPlayedToday++;
    const today = new Date().toISOString().split('T')[0];
    database.ref('users/' + userId).update({
        count: adsPlayedToday,
        lastDate: today
    });
}

// --- AD LOGIC ---

// 1. In-App Auto Settings (As requested)
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

// 2. Interstitial Function
function showInterstitial() {
    show_10555663().then(() => {
        incrementAdCounter();
    }).catch(e => console.log("Ad skipped or error"));
}

// 3. Popup Ad for cooldown
function showCooldownAd() {
    show_10555663('pop').then(() => {
        incrementAdCounter();
    }).catch(e => console.log("Popup error"));
}

function triggerManualAd() {
    showInterstitial();
}

// --- COOLDOWN TIMER (3 MINUTES) ---
function startTimer() {
    setInterval(() => {
        currentCooldown--;
        
        const mins = Math.floor(currentCooldown / 60);
        const secs = currentCooldown % 60;
        document.getElementById('timer').innerText = 
            ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')};

        if (currentCooldown <= 0) {
            currentCooldown = cooldownTime; // Reset to 3 mins
            showCooldownAd();
        }
    }, 1000);
}

// --- FOOTER TIME & DATE ---
function updateClock() {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB');
    document.getElementById('footer-time').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// --- INITIALIZE ON LOAD ---
window.onload = () => {
    updateClock();
    syncAdsData();
    startTimer();
    
    // Show interstitial immediately upon opening (Limitless requirement)
    showInterstitial();
};
