import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";   // ⭐ ADD THIS
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD3JxGr2X71-ed0rHydEHIt3cpc-0n6SJk",
  authDomain: "phoneloginapp-7e9e0.firebaseapp.com",
  projectId: "phoneloginapp-7e9e0",
  storageBucket: "phoneloginapp-7e9e0.firebasestorage.app",
  messagingSenderId: "951619846156",
  appId: "1:951619846156:web:a2a9391405b9b89bfaae29",
  measurementId: "G-RHKPQTQSHF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);   // ⭐ EXPORT AUTH

const analytics = getAnalytics(app);
