import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: process.env.FIREBASE_DB_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

const DEFAULT_UPDATES = [
  { version: "1.4.2", title: "Optimized Core & HUD Customizer", date: "2026-06-12", bedrockVersion: "1.21.0 - 1.21.10", downloadUrl: "https://github.com/CraftEdge/Client/releases/download/v1.4.2/CraftEdge_v1.4.2.mcpack", type: "stable", description: "• Up to 25% FPS increase with new Core Render optimization engine\n• Real-time Draggable HUD: Customize keystrokes, coordinate counters, and CPS viewers\n• Quick Zoom Keybind config menu added\n• Fully integrated Client-Side Cape toggle with 12 free cosmetic designs\n• Fixed coordinate-rendering issue in underwater biomes\n• Added support for Bedrock 1.21.x rendering hooks", downloads: 1420, isActive: true },
  { version: "1.3.5", title: "Cosmetics update & Particle Editor", date: "2026-05-15", bedrockVersion: "1.20.80 - 1.21.0", downloadUrl: "https://github.com/CraftEdge/Client/releases/download/v1.3.5/CraftEdge_v1.3.5.mcpack", type: "stable", description: "• Brand new Visual Particle Editor: change colors, trail sizes, and burst rates\n• Built-in Custom Crosshair Manager: import or draw your own crosshairs\n• Compact UI Toggle: reduces chat box and inventory visual scale\n• Native Zoom sound effects added\n• Fixed UI flickering on low-end Android and Windows 10/11 devices during chunk loading", downloads: 890, isActive: true },
  { version: "1.3.0-beta", title: "Experimental Chunk Pre-loader", date: "2026-04-10", bedrockVersion: "1.20.50", downloadUrl: "https://github.com/CraftEdge/Client/releases/download/v1.3.0-beta/CraftEdge_v1.3.0.mcpack", type: "beta", description: "• Beta Chunk Loader: Prefetches blocks up to 12% faster\n• Keystrokes UI customization: Choose background opacity, mouse clicks, and rainbow chroma colors\n• Bedrock Chat auto-complete enhancements\n• Minor memory leak addressed in cosmetic render thread", downloads: 320, isActive: true }
];

function getDB() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export async function handler(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const db = getDB();
    const snap = await getDocs(collection(db, 'updates'));
    let list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));

    // Seed if empty
    if (list.length === 0) {
      for (let i = 0; i < DEFAULT_UPDATES.length; i++) {
        const id = `update-${i + 1}`;
        await setDoc(doc(db, 'updates', id), DEFAULT_UPDATES[i]);
        list.push({ id, ...DEFAULT_UPDATES[i] });
      }
    }

    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return { statusCode: 200, headers, body: JSON.stringify(list) };
  } catch (e) {
    console.error(e);
    const fallback = DEFAULT_UPDATES.map((u, i) => ({ id: `update-${i+1}`, ...u }));
    return { statusCode: 200, headers, body: JSON.stringify(fallback) };
  }
}
