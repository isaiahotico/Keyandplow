document.addEventListener('DOMContentLoaded', () => {
    const claimBtn = document.getElementById('claimBtn');
    const walletInput = document.getElementById('walletAddress');
    const messageBox = document.getElementById('messageBox');
    const timerContainer = document.getElementById('timerContainer');
    const countdownDisplay = document.getElementById('countdown');
    const payoutTable = document.getElementById('payoutTable');

    // Configuration
    const COOLDOWN_TIME = 300; // 5 minutes in seconds
    const CLAIM_AMOUNT = "0.00050000 USDT";

    // 1. Initialize dummy data for the table
    const recentPayouts = [
        { user: "user***@gmail.com", amount: "0.00050000", time: "2 mins ago" },
        { user: "0x71c...882a", amount: "0.00050000", time: "5 mins ago" },
        { user: "gamer***@yahoo.com", amount: "0.00050000", time: "8 mins ago" },
    ];

    function renderTable() {
        payoutTable.innerHTML = recentPayouts.map(p => `
            <tr class="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td class="p-4 text-sm text-gray-700">${p.user}</td>
                <td class="p-4 text-sm font-bold text-green-600">${p.amount} USDT</td>
                <td class="p-4 text-sm text-gray-500">${p.time}</td>
                <td class="p-4 text-sm"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Paid</span></td>
            </tr>
        `).join('');
    }

    renderTable();

    // 2. Handle Claim Logic
    claimBtn.addEventListener('click', async () => {
        const address = walletInput.value.trim();

        // Validation
        if (!address) {
            showMessage("Please enter a valid FaucetPay email or USDT address", "error");
            return;
        }

        // Disable button & show loading
        claimBtn.disabled = true;
        claimBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        // Simulate API Call (Backend Request)
        setTimeout(() => {
            // Success Scenario
            showMessage(`${CLAIM_AMOUNT} was sent to your FaucetPay account!`, "success");
            
            // Add to table
            recentPayouts.unshift({ user: address.substring(0,6) + "...", amount: "0.00050000", time: "Just now" });
            renderTable();

            startTimer(COOLDOWN_TIME);
        }, 1500);
    });

    // 3. Timer Functionality
    function startTimer(seconds) {
        claimBtn.classList.add('hidden');
        timerContainer.classList.remove('hidden');
        
        let timeLeft = seconds;
        
        const interval = setInterval(() => {
            timeLeft--;
            countdownDisplay.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(interval);
                claimBtn.classList.remove('hidden');
                claimBtn.disabled = false;
                claimBtn.innerHTML = '<i class="fa-solid fa-bolt-lightning mr-2"></i> CLAIM NOW';
                timerContainer.classList.add('hidden');
                messageBox.classList.add('hidden');
            }
        }, 1000);
    }

    // 4. UI Helper
    function showMessage(msg, type) {
        messageBox.innerText = msg;
        messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        
        if (type === "error") {
            messageBox.classList.add('bg-red-100', 'text-red-700');
        } else {
            messageBox.classList.add('bg-green-100', 'text-green-700');
        }
    }
});
