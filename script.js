// ============================================================
//  script.js — LianN Birthday Website
// ============================================================

// ─── KURSOR ─────────────────────────────────────────────────
const cur = document.getElementById('cursor');
const curDot = document.getElementById('cursor-dot');
document.addEventListener('mousemove', e => {
  if (!cur || !curDot) return;
  cur.style.left = e.clientX + 'px';
  cur.style.top = e.clientY + 'px';
  curDot.style.left = e.clientX + 'px';
  curDot.style.top = e.clientY + 'px';
});

// ─── SISTEM HALAMAN (PAGE-BY-PAGE) ──────────────────────────
const pages = Array.from(document.querySelectorAll('.page'));
let currentPage = 0;

function showPage(idx, direction) {
  const prev = pages[currentPage];
  const next = pages[idx];
  if (!next || idx === currentPage) return;

  // Exit current
  prev.classList.remove('active');
  prev.classList.add(direction === 'forward' ? 'exit-up' : 'exit-down');

  // Enter next
  next.classList.remove('exit-up', 'exit-down');
  next.classList.add('active');

  currentPage = idx;

  // Clean up exit class after animation
  setTimeout(() => prev.classList.remove('exit-up', 'exit-down'), 700);

  updateNavButtons();
  updateNavDots();
  updateNavHighlight();
  onPageEnter(idx);
}

function nextPage() { if (currentPage < pages.length - 1) showPage(currentPage + 1, 'forward'); }
function prevPage() { if (currentPage > 0) showPage(currentPage - 1, 'backward'); }

function goToPage(idx) {
  const dir = idx > currentPage ? 'forward' : 'backward';
  showPage(idx, dir);
}

function updateNavButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage === pages.length - 1;
}

function updateNavDots() {
  document.querySelectorAll('.page-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentPage);
  });
}

function updateNavHighlight() {
  const pageId = pages[currentPage].id;
  document.querySelectorAll('#nav button').forEach(btn => {
    btn.classList.toggle('active-nav', btn.dataset.page === pageId);
  });
}

// Inisialisasi page dots
function buildPageDots() {
  const dotsWrap = document.getElementById('page-dots');
  if (!dotsWrap) return;
  pages.forEach((p, i) => {
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToPage(i);
    dotsWrap.appendChild(dot);
  });
}

// Swipe support for mobile
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 50) { dy > 0 ? nextPage() : prevPage(); }
}, { passive: true });

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextPage();
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prevPage();
});

// Scroll inside active page (do NOT trigger page nav for scrollable pages)
document.addEventListener('wheel', e => {
  const activePage = pages[currentPage];
  const isScrollable = activePage.scrollHeight > activePage.clientHeight;
  if (isScrollable) {
    const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 5;
    const atTop = activePage.scrollTop <= 5;
    if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
      e.preventDefault();
      e.deltaY > 0 ? nextPage() : prevPage();
    }
  } else {
    e.preventDefault();
    e.deltaY > 0 ? nextPage() : prevPage();
  }
}, { passive: false });

// ─── HOOK MASUK HALAMAN ─────────────────────────────────────
function onPageEnter(idx) {
  const id = pages[idx].id;
  if (id === 'typing-section') startTyping();
  if (id === 'countdown-section') updateCountdown();
  if (id === 'starmap-section') drawStarMap();
  if (id === 'game-section') { /* game waits for button */ }
}

// ─── BINTANG LATAR (Opener) ──────────────────────────────────
function createStars() {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star-dot';
    const sz = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 4}s;animation-duration:${2 + Math.random() * 3}s`;
    bg.appendChild(s);
  }
}

// ─── BUKA KARTU ──────────────────────────────────────────────
function openCard() {
  launchConfetti();
  nextPage();
  setTimeout(startTyping, 400);
}

// ─── KONFETI ─────────────────────────────────────────────────
const confCanvas = document.getElementById('confetti-canvas');
const confCtx = confCanvas ? confCanvas.getContext('2d') : null;
if (confCanvas) {
  confCanvas.width = window.innerWidth;
  confCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    confCanvas.width = window.innerWidth;
    confCanvas.height = window.innerHeight;
  });
}
let confParts = [], confRunning = false;
function launchConfetti() {
  if (!confCtx) return;
  confParts = [];
  const colors = ['#e8a0a0', '#f7d6d6', '#c9a84c', '#a0c0e8', '#b8e8a0', '#f0b0e0'];
  for (let i = 0; i < 180; i++) {
    confParts.push({
      x: Math.random() * confCanvas.width, y: -10,
      vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 4, h: Math.random() * 6 + 2,
      r: Math.random() * Math.PI * 2, dr: (Math.random() - 0.5) * 0.2, life: 1
    });
  }
  if (!confRunning) { confRunning = true; animConf(); }
}
function animConf() {
  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  confParts = confParts.filter(p => p.life > 0);
  confParts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.r += p.dr; p.life -= 0.006;
    confCtx.save(); confCtx.globalAlpha = p.life;
    confCtx.translate(p.x, p.y); confCtx.rotate(p.r);
    confCtx.fillStyle = p.color; confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confCtx.restore();
  });
  if (confParts.length > 0) requestAnimationFrame(animConf); else confRunning = false;
}

// ─── PESAN MENGETIK ──────────────────────────────────────────
const typingMessages = [
"Selamat ulang tahun sayangku, Keyza Berliana 💕",
"Semoga hari ini kamu banyak bahagia yaaa.",
"Meskipun kita jauh, kamu tetap orang yang paling aku tungguuu.",
"Jangan capek jadi diri kamu sendiri yaa, karena aku suka semua tentang kamu.",
"Semoga semua yang kamu pengen pelan-pelan bisa tercapai.",
"Pokoknya hari ini harus banyak senyum, karena ini harimu ✨"
];
let typIdx = 0, charIdx = 0, typingInterval = null;
function startTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  if (typIdx > 0) return; // sudah berjalan
  el.innerHTML = '<span class="cursor-blink"></span>';
  typIdx = 0; charIdx = 0;
  typeNext(el);
}
function typeNext(el) {
  if (typIdx >= typingMessages.length) return;
  const msg = typingMessages[typIdx];
  if (charIdx <= msg.length) {
    el.innerHTML = typingMessages.slice(0, typIdx).map(m => `<span style="opacity:0.5;display:block">${m}</span>`).join('') +
      `<span>${msg.slice(0, charIdx)}</span><span class="cursor-blink"></span>`;
    charIdx++;
    typingInterval = setTimeout(() => typeNext(el), 50);
  } else {
    typIdx++; charIdx = 0;
    setTimeout(() => typeNext(el), 400);
  }
}

// ─── COUNTDOWN ───────────────────────────────────────────────
//
// *** UBAH TANGGAL ULANG TAHUN DI SINI ***
//
// Format: new Date(TAHUN, BULAN-1, TANGGAL, 0, 0, 0)
// Contoh tanggal 20 Agustus 2025 → new Date(2025, 7, 20, 0, 0, 0)
// Bulan (0=Jan, 1=Feb, 2=Mar, 3=Apr, 4=Mei, 5=Jun,
//        6=Jul, 7=Agu, 8=Sep, 9=Okt, 10=Nov, 11=Des)
//
const birthday = new Date(2026, 4, 28, 0, 0, 0); // <-- GANTI DI SINI

function updateCountdown() {
  const now = new Date(), diff = birthday - now;
  if (diff <= 0) {
    document.getElementById('countdown-display').style.display = 'none';
    document.getElementById('surprise-msg').style.display = 'block';
    launchConfetti(); return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000);

// ─── HADIAH ──────────────────────────────────────────────────
const gifts = [
  { icon: '💌', title: '  ', text: 'Walaupun kita jauh, hati aku tetep buat kamu kok. Jadi anggap aja web ini pelukan kecil dari aku buat sayangku 🤍' },
  { icon: '🌙', title: '  ', text: 'Satu malam video call spesial buat kamu. Walaupun cuma lewat layar, aku tetep pengen nemenin hari bahagia kamu 🤍' },
  { icon: '🌹', title: '  ', text: 'Semoga nanti pas kamu lihatnya, kamu bisa senyum kecil sambil kepikiran aku 🤍' },
];
let giftIdx = 0;
function revealGift() {
  giftIdx = 0;
  const icon = document.getElementById('gift-icon');
  icon.style.transform = 'rotate(15deg) scale(1.2)';
  setTimeout(() => { icon.style.transform = ''; showGiftCard(); }, 300);
  document.getElementById('gift-reveal').style.display = 'block';
  launchConfetti();
}
function showGiftCard() {
  const g = gifts[giftIdx % gifts.length];
  const card = document.getElementById('gift-card-inner');
  card.querySelector('.g-icon').textContent = g.icon;
  card.querySelector('.g-title').textContent = g.title;
  card.querySelector('.g-text').textContent = g.text;
  card.style.opacity = 0; card.style.transform = 'translateY(16px)';
  setTimeout(() => { card.style.transition = 'all .4s'; card.style.opacity = 1; card.style.transform = 'translateY(0)'; }, 50);
}
function nextGift() { giftIdx++; showGiftCard(); }

// ─── KUIS ─────────────────────────────────────────────────────
const questions = [
  { q: "Siapa orang paling luar biasa yang ada sekarang?", opts: ["Kamu!", "Tentu saja kamu.", "100% kamu.", "Tanpa keraguan — kamu."], correct: 0 },
  { q: "Apa bahan rahasia yang membuat hari ini istimewa?", opts: ["Senyummu", "Karena kamu ada", "Tawamu", "Semua hal — KAMU"], correct: 3 },
  { q: "Siapa yang pantas mendapat semua kue hari ini?", opts: ["Kamu layak mendapatnya", "Berikan semua kuenya", "Setiap potong untukmu", "Kamu. Hanya kamu."], correct: 0 },
  { q: "Siapa yang menerangi ruangan tanpa perlu lampu?", opts: ["Tidak ada — kamu yang melakukannya", "Hanya satu — kamu", "Ruangan cerah saat kamu tersenyum", "Kamu adalah cahayanya"], correct: 2 },
];
let qIdx = 0;
function loadQuestion() {
  const q = questions[qIdx];
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('next-q-btn').style.display = 'none';
  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt'; btn.textContent = o;
    btn.onclick = () => answerQuiz(i, q.correct);
    opts.appendChild(btn);
  });
}
function answerQuiz(i, correct) {
  document.querySelectorAll('.quiz-opt').forEach((b, idx) => { if (idx === correct) b.classList.add('correct'); b.onclick = null; });
  const r = document.getElementById('quiz-result');
  r.textContent = i === correct ? "🎉 Benar! Kamu kenal dirimu dengan baik!" : "💕 Semua jawaban mengarah ke kamu juga — karena kamu segalanya!";
  r.style.display = 'block';
  document.getElementById('next-q-btn').style.display = 'block';
}
function nextQuestion() { qIdx = (qIdx + 1) % questions.length; loadQuestion(); }

// ─── GAME BALON ───────────────────────────────────────────────
let balloons = [], gameScore = 0, gameActive = false, gameAnim = null;
function startGame() {
  document.getElementById('game-msg').style.display = 'none';
  const canvas = document.getElementById('game-canvas');
  const wrap = document.getElementById('game-canvas-wrap');
  canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight;
  gameScore = 0; balloons = []; gameActive = true;
  document.getElementById('game-score').textContent = '0 harapan';
  for (let i = 0; i < 8; i++) spawnBalloon(canvas);
  animGame(canvas);
  setTimeout(() => endGame(canvas), 25000);
}
function spawnBalloon(canvas) {
  const emojis = ['🎈', '🎂', '🎀', '⭐', '💕', '✨'];
  balloons.push({ x: Math.random() * (canvas.width - 40) + 20, y: canvas.height + 40, vy: -(1 + Math.random() * 1.5), vx: (Math.random() - .5) * 0.8, r: 20 + Math.random() * 14, emoji: emojis[Math.floor(Math.random() * emojis.length)], alive: true });
}
function animGame(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balloons.forEach(b => {
    if (!b.alive) return;
    b.y += b.vy; b.x += b.vx;
    if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
    ctx.font = `${b.r * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.emoji, b.x, b.y);
  });
  balloons = balloons.filter(b => b.alive && b.y > -60);
  while (balloons.length < 8) spawnBalloon(canvas);
  if (gameActive) gameAnim = requestAnimationFrame(() => animGame(canvas));
}
function endGame(canvas) {
  gameActive = false; cancelAnimationFrame(gameAnim);
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('game-msg').innerHTML = `<p style="font-size:20px">🎉 ${gameScore} Harapan Terkumpul!</p><button id="start-game-btn" onclick="startGame()" style="margin-top:8px;pointer-events:auto">Main Lagi</button>`;
  document.getElementById('game-msg').style.display = 'block';
}
const gameWrap = document.getElementById('game-canvas-wrap');
if (gameWrap) {
  gameWrap.addEventListener('click', e => {
    if (!gameActive) return;
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
    balloons.forEach(b => {
      if (!b.alive) return;
      const dx = b.x - mx, dy = b.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < b.r + 10) {
        b.alive = false; gameScore++;
        document.getElementById('game-score').textContent = gameScore + ' harapan';
        launchConfetti();
      }
    });
  });
  // Touch support for game
  gameWrap.addEventListener('touchstart', e => {
    e.preventDefault();
    if (!gameActive) return;
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    Array.from(e.touches).forEach(t => {
      const mx = (t.clientX - rect.left) * scaleX, my = (t.clientY - rect.top) * scaleY;
      balloons.forEach(b => {
        if (!b.alive) return;
        const dx = b.x - mx, dy = b.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < b.r + 12) {
          b.alive = false; gameScore++;
          document.getElementById('game-score').textContent = gameScore + ' harapan';
          launchConfetti();
        }
      });
    });
  }, { passive: false });
}

// ─── BUKA KETIKA... ───────────────────────────────────────────
const owMessages = {
  sad: { title: "Buka ketika kamu sedih", text: "Aku tau kadang semuanya kerasa berat banget. Tapi inget ya, kamu ga sendirian kok. Kalau capek, istirahat dulu gapapa.Kalau mau cerita, aku bakal dengerin.Dan sejauh apa pun jarak kita sekarang, aku tetep ada buat kamu, sayangku 🌙" },
  happy: { title: "Buka ketika kamu bahagia", text: "Nahh gini dongg, senyumnya keluar 🤍 Aku suka banget lihat kamu bahagia kayak gini. Tetep simpan senyum itu yaa, jangan cuma hari ini aja. Karena kamu emang pantas buat dapet banyak hal baik dan bahagia 🥂" },
  missing: { title: "Buka ketika kamu kangen aku", text: "Heii sayang 🤍 Walaupun kita ga ada di tempat yang sama sekarang, aku tetep deket kok lewat semua hal kecil yang ngingetin kita satu sama lain. Lewat lagu, chat lama, atau hal random yang tiba-tiba bikin kamu inget aku. Dan sejauh apa pun jarak kita, aku tetep mikirin kamu terus, sayangku 💕" },
  proud: { title: "Buka ketika kamu bangga", text: "Coba lihat diri kamu sekarang 🌟 Kamu berhasil lewatin semuanya sampai di titik ini. Jangan buru-buru ngelewatin momen ini yaa. Karena semua usaha kamu itu ga sia-sia, dan kamu pantas buat semua hal baik yang kamu dapetin sekarang 🤍" },
  lonely: { title: "Buka ketika kamu kesepian", text: "Mungkin sekarang rasanya sepi yaa 🤍 Tapi kamu harus tau kalau banyak banget orang yang sayang sama kamu, dan aku salah satunya. Walaupun kita lagi jauh, aku tetep ada buat kamu kok. Dan kalau suatu hari kamu ngerasa ga dianggap atau ga diliat, inget aja… kamu itu selalu jadi orang yang kepikiran sama seseorang, termasuk aku 🤗" },
  love: { title: "Buka ketika kamu butuh cinta", text: "Sini aku kasih tau sesuatu yaa 🤍 Aku sayang kamu bukan cuma pas kamu lagi bahagia atau lagi baik-baik aja. Aku juga sayang sama kamu di hari-hari kamu capek, diem, overthinking, atau ngerasa jadi diri yang beda dari biasanya. Karena buat aku, semua versi kamu itu tetap berharga. Jadi jangan pernah mikir kalau kamu ga layak dicintai ya, sayangku 💕" },
};
function showOW(key) {
  const m = owMessages[key];
  document.getElementById('ow-title').textContent = m.title;
  document.getElementById('ow-text').textContent = m.text;
  const el = document.getElementById('ow-message');
  el.style.display = 'block'; el.style.opacity = 0; el.style.transform = 'translateY(16px)';
  setTimeout(() => { el.style.transition = 'all .5s'; el.style.opacity = 1; el.style.transform = 'translateY(0)'; }, 50);
}

// ─── PETA BINTANG ────────────────────────────────────────────
function drawStarMap() {
  const canvas = document.getElementById('star-canvas');
  const wrap = document.getElementById('star-canvas-wrap');
  if (!canvas || !wrap) return;
  const size = Math.min(wrap.clientWidth, 320);
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  ctx.fillStyle = '#030308'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grd.addColorStop(0, 'rgba(100,80,160,0.15)'); grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 300; i++) {
    const angle = (i * 137.508) * (Math.PI / 180);
    const dist = Math.sqrt((i / 300)) * r * 0.95;
    const x = cx + Math.cos(angle) * dist, y = cy + Math.sin(angle) * dist;
    const sz = Math.random() < 0.05 ? 2 : Math.random() < 0.15 ? 1.2 : 0.6;
    const alpha = 0.4 + Math.random() * 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = Math.random() < 0.1 ? '#ffd080' : Math.random() < 0.1 ? '#80c0ff' : '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 0.15; ctx.strokeStyle = '#c0a0ff'; ctx.lineWidth = 0.5;
  const constPts = [[cx - 60, cy - 80], [cx - 20, cy - 50], [cx + 30, cy - 70], [cx + 70, cy - 40], [cx + 50, cy + 20], [cx, cy + 60], [cx - 50, cy + 40], [cx - 70, cy], [cx - 60, cy - 80]];
  ctx.beginPath(); constPts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])); ctx.stroke();
  ctx.globalAlpha = 0.5; ctx.strokeStyle = '#e8a0a0'; ctx.lineWidth = 0.8;
  const heartPts = [[cx + 10, cy + 20], [cx + 25, cy + 5], [cx + 35, cy + 12], [cx + 35, cy + 22], [cx + 10, cy + 45], [cx - 15, cy + 22], [cx - 15, cy + 12], [cx - 5, cy + 5], [cx + 10, cy + 20]];
  ctx.beginPath(); heartPts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])); ctx.stroke();
  ctx.globalAlpha = 1; ctx.fillStyle = '#ffd080'; ctx.shadowColor = '#ffd080'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(cx, cy - 20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.2; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ─── GELOMBANG SUARA ──────────────────────────────────────────
function buildWaveform() {
  const wf = document.getElementById('waveform');
  if (!wf) return;
  for (let i = 0; i < 28; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    bar.style.height = Math.floor(8 + Math.random() * 36) + 'px';
    wf.appendChild(bar);
  }
}
let voicePlaying = false, voiceTimer = null, voiceProgress = 0;
function toggleVoice() {
  const btn = document.getElementById('voice-play-btn');
  voicePlaying = !voicePlaying;
  btn.textContent = voicePlaying ? '⏸' : '▶';
  if (voicePlaying) {
    const bars = document.querySelectorAll('.wave-bar');
    voiceTimer = setInterval(() => {
      voiceProgress = Math.min(voiceProgress + 1, 30);
      document.getElementById('voice-duration').textContent = `0:${String(voiceProgress).padStart(2, '0')} / 0:30`;
      bars.forEach(b => { b.style.height = Math.floor(8 + Math.random() * 36) + 'px'; });
      if (voiceProgress >= 30) { clearInterval(voiceTimer); voicePlaying = false; btn.textContent = '▶'; voiceProgress = 0; }
    }, 1000);
  } else { clearInterval(voiceTimer); }
}

// ─── MUSIK ────────────────────────────────────────────────────
let musicPlaying = false;
function toggleMusic() {
  musicPlaying = !musicPlaying;
  document.getElementById('music-play').textContent = musicPlaying ? '⏸' : '▶';
  document.getElementById('music-eq').classList.toggle('paused', !musicPlaying);
}

// ─── INISIALISASI ─────────────────────────────────────────────
window.addEventListener('load', () => {
  createStars();
  buildWaveform();
  buildPageDots();
  loadQuestion();
  updateNavButtons();

  // Show LianN intro first
  const intro = document.getElementById('lian-intro');
  const lianName = document.getElementById('lian-name');
  if (intro && lianName) {
    setTimeout(() => { lianName.classList.add('animate'); }, 300);
    setTimeout(() => {
      intro.style.transition = 'opacity 1s ease';
      intro.style.opacity = '0';
      setTimeout(() => {
        intro.classList.add('hidden');
        // Show first page
        pages[0].classList.add('active');
        updateNavHighlight();
      }, 1000);
    }, 3800);
  } else {
    pages[0].classList.add('active');
    updateNavHighlight();
  }

  // Nav button click skip intro
  const skipBtn = document.getElementById('lian-skip');
  if (skipBtn) {
    skipBtn.onclick = () => {
      intro.style.transition = 'opacity .4s ease';
      intro.style.opacity = '0';
      setTimeout(() => {
        intro.classList.add('hidden');
        pages[0].classList.add('active');
        updateNavHighlight();
      }, 400);
    };
  }
});