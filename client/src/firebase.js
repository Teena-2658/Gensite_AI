import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsryljm0qFW53cb6Foek0APe3Op9xzf2g",
  authDomain: "gensiteai-6d389.firebaseapp.com",
  projectId: "gensiteai-6d389",
  storageBucket: "gensiteai-6d389.appspot.com",
  messagingSenderId: "100782044397",
  appId: "1:100782044397:web:251496d50b31658db0c8e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;