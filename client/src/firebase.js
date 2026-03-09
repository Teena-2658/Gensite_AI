// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAnlqRNu2jSsaEActosu-ZOrKxLPtJ_ytk",
//   authDomain: "gensiteai-ae27a.firebaseapp.com",
//   projectId: "gensiteai-ae27a",
//   storageBucket: "gensiteai-ae27a.firebasestorage.app",
//   messagingSenderId: "650837340470",
//   appId: "1:650837340470:web:23bcd8370ad5123e374397"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);


//new 
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnlqRNu2jSsaEActosu-ZOrKxLPtJ_ytk",
  authDomain: "gensiteai-ae27a.firebaseapp.com",
  projectId: "gensiteai-ae27a",
  storageBucket: "gensiteai-ae27a.firebasestorage.app",
  messagingSenderId: "650837340470",
  appId: "1:650837340470:web:23bcd8370ad5123e374397"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();