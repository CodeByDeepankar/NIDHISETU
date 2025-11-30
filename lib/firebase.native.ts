import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB0fHTvEnRv0zRXZzG20G81uI4379XrRrI',
  authDomain: 'nidhisetu-app.firebaseapp.com',
  projectId: 'nidhisetu-app',
  storageBucket: 'nidhisetu-app.firebasestorage.app',
  messagingSenderId: '811500538636',
  appId: '1:811500538636:web:9568d1b6846504c517d729',
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const createNativeAuth = () => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
};

const auth: Auth = createNativeAuth();
const db: Firestore = getFirestore(app);

export { app, auth, db, firebaseConfig };

