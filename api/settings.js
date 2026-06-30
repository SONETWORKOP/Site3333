import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getDB();
  const docRef = doc(db, 'config', 'settings');

  if (req.method === 'GET') {
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return res.status(200).json(snap.data());
      }
      const def = { discordUrl: 'https://discord.gg/craftedge' };
      await setDoc(docRef, def);
      return res.status(200).json(def);
    } catch (e) {
      return res.status(200).json({ discordUrl: 'https://discord.gg/craftedge' });
    }
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const { discordUrl } = req.body || {};
      if (!discordUrl) {
        return res.status(400).json({ error: 'discordUrl required' });
      }
      await setDoc(docRef, { discordUrl }, { merge: true });
      return res.status(200).json({ success: true, settings: { discordUrl } });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
