// sw.js
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : "C'est l'heure du check-up KOACH ! 🐨",
        icon: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Koala/3D/koala_3d.png",
        badge: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Koala/3D/koala_3d.png",
        vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification("KOACH 🐨", options));
});
