import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwYalfamOi-97fHitPpMumUTgZ9J_e2Z4",
  authDomain: "spd2-168a1.firebaseapp.com",
  projectId: "spd2-168a1",
  storageBucket: "spd2-168a1.firebasestorage.app",
  messagingSenderId: "574551264133",
  appId: "1:574551264133:web:a859b455af44ac71e5d2ec",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
