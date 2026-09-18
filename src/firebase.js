// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAah2mXivzuCq_OIy6S-WIRp3k8LU1Kl-E",
  authDomain: "hutao-8b33c.firebaseapp.com",
  databaseURL: "https://hutao-8b33c-default-rtdb.firebaseio.com",
  projectId: "hutao-8b33c",
  storageBucket: "hutao-8b33c.appspot.com",
  messagingSenderId: "1032029690254",
  appId: "1:1032029690254:web:bea32e6443e07afc316cdf",
  measurementId: "G-24Y7T006L3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
