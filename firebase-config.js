// Firebase Dynamic Configuration & CDN Loader
// Enables production-ready cloud syncing with local offline backup.

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

// Dynamic loader for Google Firebase CDN script tags
export async function loadFirebaseSDKs() {
  if (window.firebase) return true; // Already loaded

  return new Promise((resolve, reject) => {
    // 1. Load Firebase core SDK
    const appScript = document.createElement("script");
    appScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
    appScript.onload = () => {
      // 2. Load Firestore DB SDK
      const dbScript = document.createElement("script");
      dbScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
      dbScript.onload = () => {
        // 3. Load Auth SDK
        const authScript = document.createElement("script");
        authScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
        authScript.onload = () => resolve(true);
        authScript.onerror = () => reject(new Error("Failed to load Firebase Auth CDN."));
        document.head.appendChild(authScript);
      };
      dbScript.onerror = () => reject(new Error("Failed to load Firebase Firestore CDN."));
      document.head.appendChild(dbScript);
    };
    appScript.onerror = () => reject(new Error("Failed to load Firebase App CDN."));
    document.head.appendChild(appScript);
  });
}

/**
 * Initializes Firebase dynamically using configuration provided
 * or loaded from LocalStorage settings.
 */
export async function initializeFirebase(customConfig = null) {
  try {
    await loadFirebaseSDKs();

    const config = customConfig || JSON.parse(localStorage.getItem("gurbhej_firebase_config"));
    if (!config || !config.apiKey || !config.projectId) {
      console.log("Firebase is not configured. Running in standalone local mode.");
      return null;
    }

    // Return current instance if already initialized
    if (firebaseApp) {
      return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
    }

    // Initialize Firebase Compat App
    window.firebase.initializeApp(config);
    firebaseApp = window.firebase;
    firebaseAuth = window.firebase.auth();
    firebaseDb = window.firebase.firestore();

    // Enable offline persistence in Firestore (standard production-ready billing practice!)
    try {
      await firebaseDb.enablePersistence({ synchronizeTabs: true });
      console.log("Firestore offline persistence successfully enabled.");
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence notice: Multiple tabs are open.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence notice: Browser does not support persistence.");
      }
    }

    console.log("Firebase initialized successfully! Cloud Database connected.");
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
  } catch (error) {
    console.error("Firebase dynamic initialization failed:", error);
    return null;
  }
}

/**
 * Retreives active Firebase instances.
 */
export function getFirebaseInstance() {
  if (!firebaseApp) return null;
  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
}
