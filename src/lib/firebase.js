import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
// import { toast } from "react-toastify";
import { sendFcmToken } from "../queries/notifications";
import { api } from "../api/api";

const firebaseConfig = {
  apiKey: "AIzaSyByMZb7XR5xCNyGYsR4aBzlfMQ3pBzN8P8",
  authDomain: "auksion-c8967.firebaseapp.com",
  projectId: "auksion-c8967",
  storageBucket: "auksion-c8967.firebasestorage.app",
  messagingSenderId: "638270626102",
  appId: "1:638270626102:web:f54c5e2ac60771d2607b97",
  measurementId: "G-D16ZLBLQ0S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});
const getFirebaseMessaging = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !("Notification" in window)) return null;

  try {
    return getMessaging(app);
  } catch (error) {
    return null;
  }
};

let messaging = null;
try {
  messaging = getFirebaseMessaging();
} catch (e) {
  messaging = null;
}

const generateToken = async () => {
  if (typeof window === "undefined" || !messaging || !("Notification" in window)) {
    return;
  }

  const userId = localStorage.getItem("userId");
  try {

    if (Notification.permission === "denied") {
      console.warn("❌ Push notifications are blocked in browser settings.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BND5ym5-wvp3EIYvvOpdiDxDle9Wbp3mZhlqZvEwjSSxIPzWZ-MIFN61skPhmUVTRHkBjfBj7AkahbYDDNP9arU" });

      if (!token) {
        console.error("❌ Failed to get FCM token!");
        return;
      }

      const storedToken = localStorage.getItem("fcmToken");

      if (storedToken === token) {
        // console.log("⚠️ Token already sent, skipping API request.");
        return;
      }

      // Store user preference & token
      localStorage.setItem("notificationsEnabled", "true");
      localStorage.setItem("fcmToken", token);

      // console.log(token, userId);
      // Send token to backend
      await sendFcmToken(token, userId);
      // toast.info(`token set: ${userId}, ${token}`)
    } else {
      console.warn("❌ Push Notification permission denied.");
    }
  } catch (error) {
    console.error("❌ Error requesting notifications:", error);
  }
};

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); // Get Firebase ID Token
    const encodedToken = encodeURIComponent(idToken);

    // Send ID Token to backend for verification
    const res = await api.post(`/auth/google?idToken=${encodedToken}&token=${encodedToken}`, {
      idToken: idToken,
      token: idToken,
      id_token: idToken
    });
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

export { auth, provider, messaging, generateToken, signInWithGoogle };
export default app;
