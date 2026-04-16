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
let adsWatched = 0;
let userId = "";

// --- UTILS ---
const generateUserId = () => {
    let id = localStorage.getItem('unique_user_id');
    if (!id) {
        id = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('unique_user_id', id);
    }
    return id;
};

const checkDailyReset = () => {
    const lastDate = localStorage.getItem('last_ads_date');
    const today = new Date().toLocaleDateString();

    if (lastDate !== today) {
        adsWatched = 0;
        localStorage.setItem('ads_count', 0);
        localStorage.setItem('last_ads_date', today);
    } else {
        adsWatched = parseInt(localStorage.getItem('ads_count')) || 0;
    }
    document.getElementById('dailyCount').innerText = adsWatched;
};

const updateCount = () => {
    adsWatched++;
    localStorage.setItem('ads_count', adsWatched);
    document.getElementById('dailyCount').innerText = adsWatched;
    
    // Optional: Sync with Firebase
    database.ref('users/' + userId).set({
        lastActive: new Date().toISOString(),
        adsCount: adsWatched
    });
};

// --- AD LOGIC ---
const adFunctions = [
    () => typeof show_10555663 === 'function' ? show_10555663() : Promise.reject(),
    () => typeof show_10555746 === 'function' ? show_10555746() : Promise.reject(),
    () => typeof show_10555727 === 'function' ? show_10555727() : Promise.reject()
];

async function startAutoAds() {
    // 2-second cooldown/delay before the first ad and between ads
    console.log("Cooldown started...");
    document.getElementById('statusIndicator').innerHTML = <p class="text-sm text-yellow-400 font-medium italic">Preparing next ad (2s)...</p>;
    
    setTimeout(async () => {
        try {
            // Pick a random ad function from the array
            const randomIndex = Math.floor(Math.random() * adFunctions.length);
            const randomAd = adFunctions[randomIndex];

            document.getElementById('statusIndicator').innerHTML = <p class="text-sm text-cyan-400 font-medium italic">Ad playing...</p>;
            
            await randomAd();
            
            // Success
            updateCount();
            console.log("Ad finished. Restarting loop...");
            startAutoAds(); // Loop again

        } catch (error) {
            console.error("Ad failed to load or closed early", error);
            // Even if it fails, wait and try again
            startAutoAds();
        }
    }, 2000); 
}

// --- CLOCK & FOOTER ---
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    document.getElementById('footerTime').innerText = timeStr;
    document.getElementById('footerDate').innerText = dateStr;
}

// --- INITIALIZATION ---
window.onload = () => {
    userId = generateUserId();
    document.getElementById('userIdDisplay').innerText = userId;
    
    checkDailyReset();
    
    // Start Clock
    setInterval(updateClock, 1000);
    updateClock();

    // Start Auto Ad Cycle after a brief initial delay
    startAutoAds();
};
