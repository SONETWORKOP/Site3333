import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

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
  return (event.headers['authorization'] || '').startsWith('Bearer craftedge_session_');
}

export async function handler(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'PUT') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!isAdmin(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id param required' }) };

  try {
    const db = getDB();
    const docRef = doc(db, 'updates', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };

    const existing = snap.data();
    const body = JSON.parse(event.body || '{}');
    const payload = {
      version: body.version ?? existing.version,
      title: body.title ?? existing.title,
      date: body.date ?? existing.date,
      bedrockVersion: body.bedrockVersion ?? existing.bedrockVersion,
      downloadUrl: body.downloadUrl ?? existing.downloadUrl,
      type: body.type ?? existing.type,
      description: body.description ?? existing.description,
      isActive: body.isActive ?? existing.isActive,
    };
    await updateDoc(docRef, payload);

    const allSnap = await getDocs(collection(db, 'updates'));
    const list = [];
    allSnap.forEach(d => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, updates: list }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}
