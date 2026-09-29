// hero slideshow
var slides = document.querySelectorAll('.slide');
var dots = document.querySelectorAll('#dots span');
var cur = 0, timer;
function go(n) {
  slides[cur].classList.remove('active'); dots[cur].classList.remove('active');
  cur = (n + slides.length) % slides.length;
  slides[cur].classList.add('active'); dots[cur].classList.add('active');
  restart();
}
function restart() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6000); }
dots.forEach(function (d, i) { d.onclick = function () { go(i); }; });
restart();

// burger
var burger = document.getElementById('burger'), links = document.getElementById('links');
burger.onclick = function () { links.classList.toggle('open'); };
links.querySelectorAll('a').forEach(function (a) { a.onclick = function () { links.classList.remove('open'); }; });

// project index accordion (one open at a time)
var projs = document.querySelectorAll('.proj');
projs.forEach(function (p) {
  p.querySelector('.proj-head').onclick = function () {
    var was = p.classList.contains('open');
    projs.forEach(function (q) { q.classList.remove('open'); });
    if (!was) p.classList.add('open');
  };
});

// per-pack screenshot galleries (all shots from CurseForge)
var GALLERIES = {
  ce: ['assets/shot-ce3.jpg','assets/shot-ce4.jpg','assets/shot-ce5.jpg','assets/shot-ce1.jpg','assets/shot-ce6.jpg','assets/shot-ce2.jpg','assets/shot-ce7.jpg','assets/shot-ce8.jpg'],
  hy: ['assets/shot-hy3.jpg','assets/shot-hy1.jpg','assets/shot-hy4.jpg','assets/shot-hy2.jpg','assets/shot-hy5.jpg'],
  sv: ['assets/shot-sv3.jpg','assets/shot-sv1.jpg','assets/shot-sv2.jpg'],
  replay: ['assets/replay.jpg']
};
var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'),
    lbCount = document.getElementById('lbCount'), gal = [], gi = 0;
function showShot() { lbImg.src = gal[gi]; lbCount.textContent = (gi + 1) + ' / ' + gal.length; }
function openGal(key) { gal = GALLERIES[key] || []; gi = 0; if (!gal.length) return; showShot(); lb.classList.add('open'); }
document.querySelectorAll('.shots-btn').forEach(function (b) {
  b.onclick = function () { openGal(b.getAttribute('data-pack')); };
});
document.getElementById('lbPrev').onclick = function (e) { e.stopPropagation(); gi = (gi - 1 + gal.length) % gal.length; showShot(); };
document.getElementById('lbNext').onclick = function (e) { e.stopPropagation(); gi = (gi + 1) % gal.length; showShot(); };
document.getElementById('lbClose').onclick = function () { lb.classList.remove('open'); };
lb.onclick = function (e) { if (e.target === lb) lb.classList.remove('open'); };
addEventListener('keydown', function (e) {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') lb.classList.remove('open');
  if (e.key === 'ArrowLeft') { gi = (gi - 1 + gal.length) % gal.length; showShot(); }
  if (e.key === 'ArrowRight') { gi = (gi + 1) % gal.length; showShot(); }
});

// tabs
document.querySelectorAll('.tab-btns button').forEach(function (btn) {
  btn.onclick = function () {
    document.querySelectorAll('.tab-btns button').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-p').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('p-' + btn.getAttribute('data-t')).classList.add('active');
  };
});

// scroll reveal
(function () {
  var els = document.querySelectorAll('.tile,.news-card,.steps,.tabs,.faq details,.promo-in');
  els.forEach(function (e) { e.classList.add('rv'); });
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach(function (e) { io.observe(e); });
  setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 4000);
})();

// scroll spy
var spyLinks = document.querySelectorAll('.links a[href^="#"]');
addEventListener('scroll', function () {
  var pos = scrollY + 140, current = null;
  spyLinks.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s && s.offsetTop <= pos) current = a;
  });
  spyLinks.forEach(function (a) { a.classList.toggle('active', a === current); });
}, { passive: true });

// live Discord counts (server: CraftEdge Productions)
(function () {
  var on = document.getElementById('dcOnline'), tot = document.getElementById('dcTotal');
  if (!on) return;
  fetch('https://discord.com/api/v9/invites/yGtaX5nb8M?with_counts=true')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.approximate_presence_count != null) on.textContent = d.approximate_presence_count;
      if (d.approximate_member_count != null) tot.textContent = d.approximate_member_count;
    })
    .catch(function () { on.textContent = '9+'; });
})();

// typing rotator
(function () {
  var el = document.getElementById('typer');
  if (!el) return;
  var words = ['vivid skies.', 'moody nights.', 'mirror water.', 'dark caves.', 'golden hour.'];
  var wi = 0, ci = words[0].length, del = true;
  function tick() {
    var w = words[wi];
    if (del) { ci--; el.textContent = w.slice(0, ci); if (ci === 0) { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 350); return; } setTimeout(tick, 30); }
    else { w = words[wi]; ci++; el.textContent = w.slice(0, ci); if (ci === w.length) { del = true; setTimeout(tick, 1500); return; } setTimeout(tick, 60); }
  }
  setTimeout(tick, 1600);
})();

// count-up stats
(function () {
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  function run(el) {
    var target = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
    var t0 = performance.now(), dur = 1400;
    (function step(t) {
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.4 });
  nums.forEach(function (n) { io.observe(n); });
})();
