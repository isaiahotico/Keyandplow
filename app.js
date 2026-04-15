        console.log("Ad viewed successfully");
        incrementAdCount();
        startCooldown();
    }).catch(e => {
        console.error("Ad failed or was blocked", e);
        // Even if it fails, we restart cooldown to try again
        startCooldown();
    });
}

// 4. Cooldown System (3 Minutes)
function startCooldown() {
    currentCooldown = cooldownTime;
    const statusBadge = document.getElementById('status-badge');
    statusBadge.innerText = "COOLDOWN";
    statusBadge.classList.replace('text-green-400', 'text-amber-400');
    statusBadge.classList.replace('bg-green-500/20', 'bg-amber-500/20');

    const interval = setInterval(() => {
        currentCooldown--;
        
        // Update UI
        const mins = Math.floor(currentCooldown / 60);
        const secs = currentCooldown % 60;
        document.getElementById('timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const progress = ((cooldownTime - currentCooldown) / cooldownTime) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        if (currentCooldown <= 0) {
            clearInterval(interval);
            statusBadge.innerText = "READY";
            statusBadge.classList.replace('text-amber-400', 'text-green-400');
            statusBadge.classList.replace('bg-amber-500/20', 'bg-green-500/20');
            triggerInterstitialAd(); // Trigger next ad after cooldown
        }
    }, 1000);
}

// 5. Initialize App
window.onload = () => {
    updateClock();
    syncAdsWithFirebase();

    // Configuration for In-App Interstitials (As per your code)
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

    // Auto-show first ad immediately on open
    setTimeout(() => {
        triggerInterstitialAd();
    }, 2000);
};
