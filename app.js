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

// --- STATE MANAGEMENT ---
let currentUser = localStorage.getItem('app_username') || null;
let adsPlayedToday = 0;
let cooldownTime = 180; // 3 Minutes
let currentCooldown = cooldownTime;
let timerInterval;

// --- LOGIN/LOGOUT LOGIC ---

function handleLogin() {
    const input = document.getElementById('username-input').value.trim();
    if (input.length < 3) {
        alert("Please enter a valid username (min 3 characters)");
        return;
    }
    currentUser = input;
    localStorage.setItem('app_username', currentUser);
    initApp();
}

function handleLogout() {
    localStorage.removeItem('app_username');
    location.reload();
}

function initApp() {
    if (!currentUser) return;

    // Switch Screens
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('display-username').innerText = "👤 User: " + currentUser;

    // Start Processes
    syncAdsData();
    startCooldownTimer();
    updateClock();
    
    // Ad Requirement: Show limitless on open
    showInterstitial();

    // Ad Requirement: In-App Settings Config
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
}

// --- CORE FUNCTIONALITY ---

// Firebase Daily Sync & Reset
function syncAdsData() {
    const today = new Date().toISOString().split('T')[0];
    const userRef = database.ref('users/' + currentUser);

    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.lastDate === today) {
            adsPlayedToday = data.count || 0;
        } else {
            adsPlayedToday = 0;
            userRef.update({ lastDate: today, count: 0 });
        }
        document.getElementById('ads-count').innerText = adsPlayedToday;
    });
}

function incrementAd() {
    adsPlayedToday++;
    const today = new Date().toISOString().split('T')[0];
    database.ref('users/' + currentUser).update({
        count: adsPlayedToday,
        lastDate: today
    });
}

// Ad Trigger Functions
function showInterstitial() {
    show_10555663().then(() => {
        incrementAd();
    }).catch(e => console.log("Ad skipped"));
}

function triggerManualAd() {
    showInterstitial();
}

// 3 Minute Cooldown Logic
function startCooldownTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        currentCooldown--;
        
        const mins = Math.floor(currentCooldown / 60);
        const secs = currentCooldown % 60;
        document.getElementById('timer').innerText = 
            ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')};

        if (currentCooldown <= 0) {
            currentCooldown = cooldownTime;
            // Trigger auto popup ad
            show_10555663('pop').then(() => {
                incrementAd();
            });
        }
    }, 1000);
}

// Footer Clock
function updateClock() {
    const now = new Date();
    document.getElementById('footer-date').innerText = now.toLocaleDateString('en-GB');
    document.getElementById('footer-time').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// --- INITIAL LOAD CHECK ---
window.onload = () => {
    if (currentUser) {
        initApp();
    }
};
