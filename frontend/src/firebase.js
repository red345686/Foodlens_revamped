// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyB8fG5jcnDemvNuccQkUwcniDmsFBfyIAA",
    authDomain: "foodlens-9511a.firebaseapp.com",
    projectId: "foodlens-9511a",
    storageBucket: "foodlens-9511a.firebasestorage.app",
    messagingSenderId: "683170353347",
    appId: "1:683170353347:web:fc345aa3c87a3864cf1276",
    measurementId: "G-JNKD1FJPSC"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export { auth, provider };
export default app;



