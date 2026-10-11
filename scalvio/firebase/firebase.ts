import { getApp, getApps, initializeApp } from "firebase/app";
import { GithubAuthProvider, GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpR9IAoYHIqajKpgnYr_fkujYASCnIdZ4",
  authDomain: "scalvio-admin.firebaseapp.com",
  projectId: "scalvio-admin",
  storageBucket: "scalvio-admin.firebasestorage.app",
  messagingSenderId: "199218826373",
  appId: "1:199218826373:web:94ed69e97af4f754856dec",
  measurementId: "G-FY4HMNCL2X",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
