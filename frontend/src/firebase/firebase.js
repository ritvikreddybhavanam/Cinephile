import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDM9HeRo_wPGC1Tka6TNfz4pPEZfsl6d_E",
    authDomain: "film-buff-5c467.firebaseapp.com",
    projectId: "film-buff-5c467",
    storageBucket: "film-buff-5c467.firebasestorage.app",
    messagingSenderId: "322356197049",
    appId: "1:322356197049:web:444a52718a03a51c56cd68",
    measurementId: "G-RVLPGH5KHV"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };