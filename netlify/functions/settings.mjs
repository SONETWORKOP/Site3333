import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: process.env.FIREBASE_DB_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

function getDB() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

function isAdmin(event) {
  const auth = event.headers['authorization'] || '';
  return auth.startsWith('Bearer craftedge_session_');
}

export async function handler(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const db = getDB();
  const docRef = doc(db, 'config', 'settings');

  if (event.httpMethod === 'GET') {
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) return { statusCode: 200, headers, body: JSON.stringify(snap.data()) };
      const def = { discordUrl: 'https://discord.gg/craftedge' };
      await setDoc(docRef, def);
      return { statusCode: 200, headers, body: JSON.stringify(def) };
    } catch (e) {
      return { statusCode: 200, headers, body: JSON.stringify({ discordUrl: 'https://discord.gg/craftedge' }) };
    }
  }

  if (event.httpMethod === 'PUT') {
    if (!isAdmin(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    try {
      const { discordUrl } = JSON.parse(event.body || '{}');
      if (!discordUrl) return { statusCode: 400, headers, body: JSON.stringify({ error: 'discordUrl required' }) };
      await setDoc(docRef, { discordUrl }, { merge: true });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, settings: { discordUrl } }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}
