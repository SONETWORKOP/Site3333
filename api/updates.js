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

const DEFAULT_UPDATES = [
  {
    version: '1.4.2',
    title: 'Optimized Core & HUD Customizer',
    date: '2026-06-12',
    bedrockVersion: '1.21.0 - 1.21.10',
    downloadUrl: 'https://github.com/CraftEdge/Client/releases/download/v1.4.2/CraftEdge_v1.4.2.mcpack',
    type: 'stable',
    description: '• Up to 25% FPS increase\n• Real-time Draggable HUD\n• Quick Zoom Keybind\n• Cape toggle with 12 cosmetics\n• Fixed underwater rendering',
    downloads: 1420,
    isActive: true,
  },
  {
    version: '1.3.5',
    title: 'Cosmetics update & Particle Editor',
    date: '2026-05-15',
    bedrockVersion: '1.20.80 - 1.21.0',
    downloadUrl: 'https://github.com/CraftEdge/Client/releases/download/v1.3.5/CraftEdge_v1.3.5.mcpack',
    type: 'stable',
    description: '• Visual Particle Editor\n• Custom Crosshair Manager\n• Compact UI Toggle\n• Zoom sound effects',
    downloads: 890,
    isActive: true,
  },
];

function getDB() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDB();
    const snap = await getDocs(collection(db, 'updates'));
    let list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));

    if (list.length === 0) {
      for (let i = 0; i < DEFAULT_UPDATES.length; i++) {
        const id = `update-${i + 1}`;
        await setDoc(doc(db, 'updates', id), DEFAULT_UPDATES[i]);
        list.push({ id, ...DEFAULT_UPDATES[i] });
      }
    }

    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return res.status(200).json(list);
  } catch (e) {
    console.error(e);
    const fallback = DEFAULT_UPDATES.map((u, i) => ({ id: `update-${i + 1}`, ...u }));
    return res.status(200).json(fallback);
  }
}
