import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDNWYh3Kqv8Ho-ShKrdKjoX8KXuPR7Zrms",
  authDomain:        "uniuniessentials.firebaseapp.com",
  projectId:         "uniuniessentials",
  storageBucket:     "uniuniessentials.firebasestorage.app",
  messagingSenderId: "823065522330",
  appId:             "1:823065522330:web:0fe3fd9420bea83871ef23",
  measurementId:     "G-KEY8L528Q2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);