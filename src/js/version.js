// Get the current timestamp in YYYYMMDD-HHMMSS format
const buildTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '-');
const versionDisplay = document.getElementById('versionDisplay');

if (versionDisplay) {
    // Update the version display with the timestamp
    versionDisplay.textContent = `v${buildTimestamp}`;
} 