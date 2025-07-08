// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAemeneTfWmG8KmV1BlCWJS7LthjV0Cm8Q",
  authDomain: "tic-tac-toe-647d2.firebaseapp.com",
  projectId: "tic-tac-toe-647d2",
  storageBucket: "tic-tac-toe-647d2.appspot.com", // ✅ CORRECTED
  messagingSenderId: "966883798325",
  appId: "1:966883798325:web:12c03cfd5e67035e96f07c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
