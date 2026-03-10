// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsryljm0qFW53cb6Foek0APe3Op9xzf2g",
  authDomain: "gensiteai-6d389.firebaseapp.com",
  projectId: "gensiteai-6d389",
  storageBucket: "gensiteai-6d389.firebasestorage.app",
  messagingSenderId: "100782044397",
  appId: "1:100782044397:web:251496d50b31658db0c8e4",
  measurementId: "G-GCDHK5W67W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);