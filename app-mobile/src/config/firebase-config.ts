import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC4PLAtu0dqwI9oRyfSyfFSZ_ByOfI8SOQ",  // <-- EXATAMENTE igual ao painel
  authDomain: "airport-agent-publisher-mobile.firebaseapp.com",
  projectId: "airport-agent-publisher-mobile",
  // bucket no formato padrão do Firebase Storage
  storageBucket: "airport-agent-publisher-mobile.appspot.com",
  messagingSenderId: "194520316138",
  appId: "1:194520316138:web:0ec2b349de08389518bf93",
  measurementId: "G-Q8140PSBW9",
  // se você ativou o Realtime Database, mantenha essa URL:
  databaseURL: "https://airport-agent-publisher-mobile-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);          // Autenticação (login)
export const db = getFirestore(app);       // Firestore
export const rtdb = getDatabase(app);      // Realtime Database
