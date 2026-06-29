/* ============================================================
   CraftEdge — app.js
   ============================================================ */

let updates = [];
let discordUrl = 'https://discord.gg/craftedge';
let adminToken = null;

const FEATURES = [
  { title: 'Custom Crosshair', desc: 'Precision-designed reticle overlays with editable thickness, gap, and center dot.', icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
  { title: 'FPS Counter', desc: 'Real-time, ultra-light frames-per-second indicator to track rendering performance.', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { title: 'Speedometer (BPS)', desc: 'Accurate block-per-second velocity tracker for precise speed measurement.', icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>' },
  { title: 'Cape & Wings System', desc: 'Equip custom animated capes and wing cosmetics with real-time in-game preview.', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { title: 'Direction HUD', desc: 'Sleek top-centered compass strip showing precise cardinal directions and yaw.', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="14.5" y2="15"/>' },
  { title: 'Fullbright Module', desc: 'Remove all darkness — see every cave and dungeon in full brightness.', icon: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' },
];

function icon(paths) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();
  loadUpdates();
  setupUI();
  drawParticles();
});

// ─── Particles ────────────────────────────────────────
function drawParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 55; i++) {
    dots.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.15,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x += d.dx; d.y += d.dy;
      if (d.x < 0 || d.x > w) d.dx *= -1;
      if (d.y < 0 || d.y > h) d.dy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${d.a})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

// ─── Features ─────────────────────────────────────────
function renderFeatures() {
  document.getElementById('featuresContainer').innerHTML = FEATURES.map(f => `
    <div class="card">
      <div class="card-icon">${icon(f.icon)}</div>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');
}

// ─── Updates ──────────────────────────────────────────
async function loadUpdates() {
  try {
    const res = await fetch('/.netlify/functions/updates');
    updates = await res.json();
  } catch (e) {
    console.error(e);
    updates = [];
  }
  renderUpdates();
}

function renderUpdates() {
  const c = document.getElementById('updatesContainer');
  if (!updates.length) {
    c.innerHTML = '<p class="loading">No updates yet.</p>';
    return;
  }
  c.innerHTML = updates.map(u => `
    <div class="update-item">
      <div class="update-top">
        <span class="update-version">v${u.version}</span>
        <span class="update-type ${u.type === 'beta' ? 'beta' : ''}">${u.type || 'stable'}</span>
      </div>
      <div class="update-title">${u.title}</div>
      <div class="update-meta">${u.date} · Bedrock ${u.bedrockVersion || ''} · ${u.downloads || 0} downloads</div>
      <div class="update-desc">${(u.description || '').slice(0, 220)}${(u.description || '').length > 220 ? '…' : ''}</div>
      <div class="update-actions">
        <button onclick="downloadUpdate('${u.id}','${u.downloadUrl}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
        ${adminToken ? `
        <button onclick="prefillEdit('${u.id}')">Edit</button>
        <button class="btn-del" onclick="deleteUpdate('${u.id}')">Delete</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function downloadUpdate(id, url) {
  try { await fetch(`/.netlify/functions/updates-download?id=${id}`, { method: 'POST' }); } catch (_) {}
  window.open(url, '_blank');
}

// ─── UI Setup ─────────────────────────────────────────
function setupUI() {
  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

  // Admin FAB
  document.getElementById('adminFab').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('open');
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Download hero btn
  document.getElementById('downloadBtn').addEventListener('click', () => {
    if (updates.length) window.open(updates[0].downloadUrl, '_blank');
    else alert('No downloads available yet.');
  });

  // Admin actions
  document.getElementById('loginBtn').addEventListener('click', adminLogin);
  document.getElementById('adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('addUpdateBtn').addEventListener('click', addUpdate);

  // Discord links
  updateDiscordLinks();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

function updateDiscordLinks() {
  ['discordLink','mobileDiscordLink','footerDiscord','cosmeticDiscordBtn','heroDiscordBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = discordUrl;
  });
}

// ─── Admin ────────────────────────────────────────────
async function adminLogin() {
  const pw = document.getElementById('adminPassword').value;
  const msg = document.getElementById('loginMsg');
  try {
    const res = await fetch('/.netlify/functions/admin-login', {
      method: 'POST',
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (data.success) {
      adminToken = data.token;
      msg.textContent = '✓ Logged in';
      msg.className = 'msg ok';
      document.getElementById('adminControls').style.display = 'block';
      document.getElementById('adminPassword').value = '';
      renderUpdates();
      loadSettings();
    } else {
      msg.textContent = '✗ ' + (data.message || 'Wrong password');
      msg.className = 'msg err';
    }
  } catch (e) {
    msg.textContent = '✗ ' + e.message;
    msg.className = 'msg err';
  }
}

async function loadSettings() {
  try {
    const res = await fetch('/.netlify/functions/settings');
    const data = await res.json();
    if (data.discordUrl) {
      discordUrl = data.discordUrl;
      document.getElementById('discordUrl').value = data.discordUrl;
      updateDiscordLinks();
    }
  } catch (_) {}
}

async function saveSettings() {
  const url = document.getElementById('discordUrl').value;
  const msg = document.getElementById('settingsMsg');
  try {
    const res = await fetch('/.netlify/functions/settings', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ discordUrl: url })
    });
    const data = await res.json();
    if (data.success) {
      msg.textContent = '✓ Saved'; msg.className = 'msg ok';
      discordUrl = url; updateDiscordLinks();
    } else { msg.textContent = '✗ ' + data.error; msg.className = 'msg err'; }
  } catch (e) { msg.textContent = '✗ ' + e.message; msg.className = 'msg err'; }
}

async function addUpdate() {
  const version = document.getElementById('newVersion').value.trim();
  const title   = document.getElementById('newTitle').value.trim();
  const url     = document.getElementById('newUrl').value.trim();
  const desc    = document.getElementById('newDesc').value.trim();
  const msg     = document.getElementById('updateMsg');

  if (!version || !title || !url) {
    msg.textContent = '✗ Version, title and URL are required';
    msg.className = 'msg err'; return;
  }
  try {
    const res = await fetch('/.netlify/functions/updates-create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ version, title, downloadUrl: url, description: desc })
    });
    const data = await res.json();
    if (data.success) {
      updates = data.updates; renderUpdates();
      ['newVersion','newTitle','newUrl','newDesc'].forEach(id => document.getElementById(id).value = '');
      msg.textContent = '✓ Update added'; msg.className = 'msg ok';
    } else { msg.textContent = '✗ ' + data.error; msg.className = 'msg err'; }
  } catch (e) { msg.textContent = '✗ ' + e.message; msg.className = 'msg err'; }
}

async function deleteUpdate(id) {
  if (!confirm('Delete this update?')) return;
  try {
    const res = await fetch(`/.netlify/functions/updates-delete?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) { updates = data.updates; renderUpdates(); }
  } catch (e) { console.error(e); }
}

function prefillEdit(id) {
  const u = updates.find(x => x.id === id);
  if (!u) return;
  document.getElementById('newVersion').value = u.version;
  document.getElementById('newTitle').value   = u.title;
  document.getElementById('newUrl').value     = u.downloadUrl;
  document.getElementById('newDesc').value    = u.description || '';
  document.getElementById('newVersion').scrollIntoView({ behavior: 'smooth' });
}
