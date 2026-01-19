import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { RegistrationData, SponsorshipInquiry } from "../types";

/* ======================================================
   FIREBASE CONFIG (VITE SAFE)
====================================================== */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// COLLECTIONS
const COLLECTIONS = {
  REGISTRATIONS: "registrations",
  SPONSORSHIPS: "sponsorships"
};

/* ======================================================
   PUBLIC: Save a new registration
====================================================== */
export const saveRegistration = async (data: RegistrationData) => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.REGISTRATIONS, data.id),
      data,
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving registration:", error);
    throw error;
  }
};

/* ======================================================
   PUBLIC: Fetch registration by ID
====================================================== */
export const getRegistrationById = async (
  id: string
): Promise<RegistrationData | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.REGISTRATIONS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as RegistrationData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching registration:", error);
    throw error;
  }
};

/* ======================================================
   PUBLIC: Save sponsorship inquiry
====================================================== */
export const saveSponsorship = async (data: SponsorshipInquiry) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SPONSORSHIPS, data.id), data);
  } catch (error) {
    console.error("Error saving sponsorship:", error);
    throw error;
  }
};
