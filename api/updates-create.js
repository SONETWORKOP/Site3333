import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'carbide-karst-cn56p',
  appId: '1:167651520855:web:87d49ba358ae76d5714e12',
  apiKey: 'AIzaSyD9NkwZz_lB9U151q3pCwz9fVSvgA2mlA0',
  authDomain: 'carbide-karst-cn56p.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-b381ded3-8607-40c9-b944-335f3be8de1e',
  storageBucket: 'carbide-karst-cn56p.firebasestorage.app',
  messagingSenderId: '167651520855',
};

function getDB() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

function isAdmin(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer craftedge_session_');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const db = getDB();
    const { version, title, downloadUrl, description, date, bedrockVersion, type } = req.body || {};

    if (!version || !title || !downloadUrl) {
      return res.status(400).json({ error: 'version, title, downloadUrl required' });
    }

    const id = `update_${Date.now()}`;
    const payload = {
      version,
      title,
      date: date || new Date().toISOString().split('T')[0],
      bedrockVersion: bedrockVersion || '1.21.x',
      downloadUrl,
      type: type || 'stable',
      description: description || '',
      downloads: 0,
      isActive: true,
    };

    await setDoc(doc(db, 'updates', id), payload);

    const snap = await getDocs(collection(db, 'updates'));
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return res.status(200).json({ success: true, updates: list });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
