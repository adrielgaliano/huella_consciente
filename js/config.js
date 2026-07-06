// js/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ⚠️ coneccion con base de datos
const firebaseConfig = {
    apiKey: "AIzaSyB-YhYo3ns9Qv4VqLtoaQbFSdVc-ab7n-8",
    authDomain: "huella-consciente-db.firebaseapp.com",
    projectId: "huella-consciente-db",
    storageBucket: "huella-consciente-db.firebasestorage.app",
    messagingSenderId: "391481979356",
    appId: "1:391481979356:web:df90462f7e6bc62b5f5f19",
    measurementId: "G-LQREM7ZJ3J"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
