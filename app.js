
// --- DATABASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBwpa8mA83JAv2A2Dj0rh5VHwodyv5N3dg",
    authDomain: "facebook-follow-to-follow.firebaseapp.com",
    databaseURL: "https://facebook-follow-to-follow-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "facebook-follow-to-follow",
    storageBucket: "facebook-follow-to-follow.app", // Corrected: should be storageBucket
    messagingSenderId: "589427984313",
    appId: "1:589427984313:web:a17b8cc851efde6dd79868"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // --- User Management ---
    let userId = localStorage.getItem('userUniqueId');
    const userIdElement = document.getElementById('userId');

    if (!userId) {
        userId = generateUniqueId();
        localStorage.setItem('userUniqueId', userId);
        // Save to Firebase for potential cross-device tracking or analytics
        database.ref(`users/${userId}`).set({
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        });
    }
    userIdElement.textContent = userId;

    function generateUniqueId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    // --- Daily Ad Count ---
    const dailyAdCountElement = document.getElementById('dailyAdCount');
    const AD_COUNT_STORAGE_KEY = 'dailyAdCount';
    const LAST_RESET_DATE_KEY = 'lastResetDate';

    function getDailyAdCount() {
        const today = new Date().toDateString();
        const lastResetDate = localStorage.getItem(LAST_RESET_DATE_KEY);

        if (lastResetDate !== today) {
            // Reset count if the date has changed
            localStorage.setItem(AD_COUNT_STORAGE_KEY, '0');
            localStorage.setItem(LAST_RESET_DATE_KEY, today);
            return 0;
        }
        return parseInt(localStorage.getItem(AD_COUNT_STORAGE_KEY) || '0', 10);
    }

    function incrementDailyAdCount() {
        const currentCount = getDailyAdCount();
        const newCount = currentCount + 1;
        localStorage.setItem(AD_COUNT_STORAGE_KEY, newCount.toString());
        dailyAdCountElement.textContent = newCount;
        // Optionally, save to Firebase for daily analytics
        database.ref(`adCounts/${userId}/${new Date().toISOString().split('T')[0]}`).transaction(current => {
            return (current || 0) + 1;
        });
    }

    dailyAdCountElement.textContent = getDailyAdCount();

    // --- Time and Date Footer ---
    const currentTimeElement = document.getElementById('currentTime');
    const currentDateElement = document.getElementById('currentDate');

    function updateDateTime() {
        const now = new Date();
        currentTimeElement.textContent = now.toLocaleTimeString();
        currentDateElement.textContent = now.toLocaleDateString();
    }
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call

    // --- Ad Logic ---
    const adZoneId = '10555663'; // Your ad zone ID
    const interstitialCooldownKey = 'interstitialCooldown';
    const inAppCooldownKey = 'inAppCooldown';

    // Helper to check cooldown
    function isAdReady(cooldownKey) {
        const lastShown = localStorage.getItem(cooldownKey);
        if (!lastShown) return true;
        const now = Date.now();
        const timeSinceLastShow = now - parseInt(lastShown, 10);
        // For interstitial, let's set a reasonable cooldown (e.g., 60 seconds)
        // For in-app, we'll rely on the SDK's interval, but also have a basic check
        const cooldownDuration = cooldownKey === interstitialCooldownKey ? 60000 : 15000; // 60s for interstitial, 15s for in-app as a fallback
        return timeSinceLastShow >= cooldownDuration;
    }

    function markAdShown(cooldownKey) {
        localStorage.setItem(cooldownKey, Date.now().toString());
        incrementDailyAdCount();
    }

    // --- Interstitial Ad ---
    const showInterstitialBtn = document.getElementById('showInterstitialBtn');

    function displayInterstitialAd() {
        if (typeof show_ad_zone_id === 'function') {
            show_ad_zone_id(adZoneId) // Use the main function for interstitial as per SDK example
                .then(() => {
                    console.log('Interstitial Ad Shown.');
                    markAdShown(interstitialCooldownKey);
                })
                .catch(error => {
                    console.error('Error displaying Interstitial Ad:', error);
                });
        } else {
            console.error('Ad SDK function show_ad_zone_id is not defined.');
        }
    }

    showInterstitialBtn.addEventListener('click', () => {
        if (isAdReady(interstitialCooldownKey)) {
            displayInterstitialAd();
        } else {
            alert("Please wait a moment before showing another interstitial ad.");
        }
    });

    // Auto-show interstitial on app open (simulated)
    // In a real app, this would be triggered on app load or screen change.
    // For this example, we'll trigger it after a short delay.
    // Note: For mobile apps, the SDK might have specific lifecycle events.
    // For web, this is a simulation.
    setTimeout(() => {
        if (isAdReady(interstitialCooldownKey)) {
            displayInterstitialAd();
        }
    }, 2000); // Show after 2 seconds on initial load

    // Auto-show interstitial after cooldown
    // This simulates the "every 30 seconds" for *in-app* type ads from your example.
    // For true interstitial, you'd want a longer interval and likely user interaction.
    setInterval(() => {
        if (isAdReady(interstitialCooldownKey)) {
            // This is a simplified approach. In a real app, you'd want to ensure
            // the user is not actively engaged or use more sophisticated triggers.
            console.log("Attempting to show interstitial ad due to cooldown.");
            displayInterstitialAd();
        }
    }, 30000); // Attempt every 30 seconds if ready

    // --- In-App Ad ---
    const showInAppBtn = document.getElementById('showInAppBtn');

    function displayInAppAd() {
        // Using the specific inApp type as per your example
        if (typeof show_ad_zone_id === 'function') {
            show_ad_zone_id({
                type: 'inApp',
                inAppSettings: {
                    frequency: 2,     // Show 2 ads
                    capping: 0.1,     // within 0.1 hours (6 minutes)
                    interval: 30,     // 30-second interval between them
                    timeout: 5,       // 5-second delay before the first one
                    everyPage: 0      // 0: session is saved when navigating between pages. 1: session resets on page navigation.
                }
            })
            .then(() => {
                console.log('In-App Ad Shown.');
                markAdShown(inAppCooldownKey); // Track for our own basic cooldown if needed
            })
            .catch(error => {
                console.error('Error displaying In-App Ad:', error);
            });
        } else {
            console.error('Ad SDK function show_ad_zone_id is not defined.');
        }
    }

    showInAppBtn.addEventListener('click', () => {
        if (isAdReady(inAppCooldownKey)) {
            displayInAppAd();
        } else {
            alert("Please wait a moment before showing another in-app ad.");
        }
    });

    // --- Rewarded Ad ---
    const showRewardedBtn = document.getElementById('showRewardedBtn');

    // Assuming show_10555663() is for rewarded ads as in your example
    // IMPORTANT: Replace '10555663' if this is a different zone for rewarded ads.
    // The SDK might have specific functions or arguments for rewarded ads.
    // Using your provided examples as a reference:
    const rewardedAdFunction = window[`show_${adZoneId}`]; // Dynamically get function

    function displayRewardedAd() {
        if (rewardedAdFunction && typeof rewardedAdFunction === 'function') {
            rewardedAdFunction() // Assuming no arguments for basic rewarded
                .then(() => {
                    console.log('Rewarded Ad Shown and Completed.');
                    // Add your user reward logic here
                    alert('Congratulations! You have earned a reward for watching the ad!');
                    markAdShown('rewardedCooldown'); // Add cooldown for rewarded ads
                })
                .catch(error => {
                    console.error('Error displaying Rewarded Ad:', error);
                    alert('There was an error showing the rewarded ad. Please try again.');
                });
        } else {
            console.error(`Ad SDK function show_${adZoneId} is not defined.`);
            alert('Rewarded ad function is not available.');
        }
    }

    showRewardedBtn.addEventListener('click', () => {
        if (isAdReady('rewardedCooldown')) {
            displayRewardedAd();
        } else {
            alert("Please wait a moment before showing another rewarded ad.");
        }
    });

    // --- Handling Multiple Ad SDKs/Zones from your example ---
    // If you have multiple `show_XXXXXX` functions, you'd need to map them.
    // Example:
    /*
    if (window.show_10555746 && typeof window.show_10555746 === 'function') {
        // Map show_10555746 to a specific ad type or button
    }
    if (window.show_10555727 && typeof window.show_10555727 === 'function') {
        // Map show_10555727 to a specific ad type or button
    }
    */

    // --- Ad Network Callbacks (if supported by SDK) ---
    // The SDK might provide global callback functions you can define.
    // For example:
    // window.onAdLoaded = () => console.log('Ad Loaded');
    // window.onAdFailedToLoad = (error) => console.error('Ad Failed:', error);
    // window.onAdDismissed = () => {
    //     console.log('Ad Dismissed');
    //     // This is often where you'd increment counts or grant rewards
    //     // Be careful not to double-count if the SDK handles it.
    // };

    // --- Initial Ad Display Attempt ---
    // You can decide which ads to try and show on initial load.
    // For this example, we already have a setTimeout for interstitial.
    // If you want to show an in-app ad on load:
    // setTimeout(displayInAppAd, 5000); // Show in-app after 5 seconds

} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("Error initializing the application. Please check the console.");
}

