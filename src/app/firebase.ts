import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, User, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
console.log(firebaseApiKey);

export const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "quizquester-8c65a.firebaseapp.com",
  projectId: "quizquester-8c65a",
  storageBucket: "quizquester-8c65a.appspot.com",
  messagingSenderId: "1070297716253",
  appId: "1:1070297716253:web:252257265ac7c21f4b98f4",
};

const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth();
export const db = getFirestore(app);
