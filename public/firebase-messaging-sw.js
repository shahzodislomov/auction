importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyByMZb7XR5xCNyGYsR4aBzlfMQ3pBzN8P8",
  authDomain: "auksion-c8967.firebaseapp.com",
  projectId: "auksion-c8967",
  storageBucket: "auksion-c8967.firebasestorage.app",
  messagingSenderId: "638270626102",
  appId: "1:638270626102:web:f54c5e2ac60771d2607b97",
  measurementId: "G-D16ZLBLQ0S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
});

// Handle background notifications
// self.addEventListener("push", (event) => {
//   if (event.data) {
//       const notificationData = event.data.json();
//       console.log("🔔 Background Notification Received:", notificationData);

//       const { title, body } = notificationData.notification;
//       const url = notificationData.data?.url || "https://front-auction.tenzorsoft.uz";

//       const options = {
//           body: body,
//           icon: "/logo192.png",
//           data: { url: url }
//       };

//       event.waitUntil(
//           self.registration.showNotification(title, options)
//       );
//   }
// });

// Handle click on notifications
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   const url = event.notification.data?.url || "https://front-auction.tenzorsoft.uz";
//   event.waitUntil(
//       clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
//           for (let client of windowClients) {
//               if (client.url === url && "focus" in client) {
//                   return client.focus();
//               }
//           }
//           if (clients.openWindow) {
//               return clients.openWindow(url);
//           }
//       })
//   );
// });