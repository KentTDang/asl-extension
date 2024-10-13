import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPNFDIQyj3cnb7_7oLQxWmObXFistm5Nw",
  authDomain: "asl-extension-33bb4.firebaseapp.com",
  projectId: "asl-extension-33bb4",
  storageBucket: "asl-extension-33bb4.appspot.com",
  messagingSenderId: "741270784010",
  appId: "1:741270784010:web:414b88f27fe838fce237f3",
  measurementId: "G-05MN9WEXY9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };