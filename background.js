// Function to perform fetch with a timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPromise = fetch(url, { ...options, signal });

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetchPromise.finally(() => clearTimeout(timeoutId));
}

checkRunning = false;

// Function to check the connection and update the badge
function checkConnection() {
    const startTime = Date.now();

    checkRunning = true;
    fetchWithTimeout('https://www.google.com/generate_204', {}, 5000)
        .then(response => {
            if (response.ok) {
                const latency = Date.now() - startTime;
                chrome.action.setBadgeText({ text: latency.toString() });
                if (latency < 100) {
                    chrome.action.setBadgeBackgroundColor({ color: '#00FF00' }); // Green color
                } else if (latency < 1000) {
                    chrome.action.setBadgeBackgroundColor({ color: '#FFFF00' }); // Yellow color
                } else {
                    chrome.action.setBadgeBackgroundColor({ color: '#FF8000' }); // Red color
                }
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            chrome.action.setBadgeText({ text: 'F' });
            chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Red color
        })
        .finally(() => {
            checkRunning = false;
        });
}

// Set up an alarm to check the connection every second
chrome.alarms.create('checkConnection', { periodInMinutes: 2 / 60 }); // 2 second

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkConnection') {
        checkConnection();
    }
});

// Initial check when the extension is loaded
checkConnection();
