console.log("Service worker running...");

// Gestion des messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background.js:", message);

  if (message.type === "TOGGLE_SIMULATION") {
    simulationEnabled = message.enabled;
    console.log(`Simulation ${simulationEnabled ? "activée" : "désactivée"}`);
    sendResponse({ success: true });
  } else if (message.action === "overrideNavigator") {
    sendResponse({ success: true, message: "Navigator override acknowledged." });
  }
});

// Événements du service worker
self.addEventListener("install", (event) => {
  console.log("Service worker installed.");
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated.");
});

self.addEventListener("fetch", (event) => {
  console.log("Service worker intercepting fetch:", event.request.url);
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and running.");
});