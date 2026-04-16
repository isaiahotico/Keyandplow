import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- APP LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateClock();
    setInterval(updateClock, 1000);
    
    // Auto-show ad after 3 seconds delay for better loading
    setTimeout(showRandomAd, 3000);
});

function initApp() {
    let uid = localStorage.getItem('adApp_uid');
    if (!uid) {
        uid = 'UID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('adApp_uid', uid);
    }
    document.getElementById('userId').innerText = uid;

    checkDailyReset();
    updateDisplayCount();
}

// Function to handle clock and date
function updateClock() {
    const now = new Date();
    document.getElementById('footerDate').innerText = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    document.getElementById('footerTime').innerText = now.toLocaleTimeString();
}

// Daily Reset Logic
function checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('adApp_lastDate');

    if (lastDate !== today) {
        localStorage.setItem('adApp_lastDate', today);
        localStorage.setItem('adApp_count', '0');
    }
}

function updateDisplayCount() {
    const count = localStorage.getItem('adApp_count') || 0;
    document.getElementById('adCount').innerText = count;
}

// Increment Count in LocalStorage and Firebase
async function incrementCount() {
    let count = parseInt(localStorage.getItem('adApp_count') || 0);
    count++;
    localStorage.setItem('adApp_count', count);
    updateDisplayCount();

    // Update Firebase
    const uid = localStorage.getItem('adApp_uid');
    const userRef = ref(db, 'users/' + uid);
    try {
        await update(userRef, {
            last_played: new Date().toISOString(),
            total_ads_today: count
        });
    } catch (e) {
        console.error("Firebase Update Error: ", e);
    }
}

// Show Random Ad Automatically
async function showRandomAd() {
    const status = document.getElementById('status');
    status.innerText = "Attempting to load random ad...";

    // Array of available ad functions from your SDK
    const adPool = [
        () => show_10555663(),
        () => show_10555746(),
        () => show_10555727(),
        () => show_10555663('pop')
    ];

    // Pick one randomly
    const randomIndex = Math.floor(Math.random() * adPool.length);
    const selectedAd = adPool[randomIndex];

    try {
        await selectedAd();
        // Success logic
        status.innerText = "Ad watched successfully!";
        incrementCount();
        
        // Loop: Try showing another ad after 10 seconds
        setTimeout(showRandomAd, 10000);
    } catch (error) {
        console.error("Ad failed:", error);
        status.innerText = "Ad block detected or load failed. Retrying...";
        setTimeout(showRandomAd, 5000); // Retry soon
    }
}
