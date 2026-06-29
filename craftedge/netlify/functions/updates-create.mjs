import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

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
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!isAdmin(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const db = getDB();
    const body = JSON.parse(event.body || '{}');
    if (!body.version || !body.title || !body.downloadUrl) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'version, title, downloadUrl required' }) };
    }
    const id = `update_${Date.now()}`;
    const payload = {
      version: body.version,
      title: body.title,
      date: body.date || new Date().toISOString().split('T')[0],
      bedrockVersion: body.bedrockVersion || '1.21.x',
      downloadUrl: body.downloadUrl,
      type: body.type || 'stable',
      description: body.description || '',
      downloads: 0,
      isActive: body.isActive !== undefined ? body.isActive : true
    };
    await setDoc(doc(db, 'updates', id), payload);

    // Return updated list
    const snap = await getDocs(collection(db, 'updates'));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, updates: list }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}
