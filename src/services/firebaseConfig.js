import { initializeApp } from "firebase/app";
import {
  getFirestore,
  disableNetwork,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Services
const db = getFirestore(app);
const auth = getAuth(app);

// 3. Turn ON Local Hard Drive Saving (CRITICAL FOR OFFLINE)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Multiple tabs open, offline mode disabled.");
  } else if (err.code === "unimplemented") {
    console.warn("Browser doesn't support offline storage.");
  }
});

// 4. Turn OFF the Internet Connection
disableNetwork(db)
  .then(() => console.log("Amtech Phone Manager is running strictly OFFLINE."))
  .catch((error) => console.error("Network lockdown failed:", error));

// 5. Export them for the rest of your app to use
export { auth, db };
