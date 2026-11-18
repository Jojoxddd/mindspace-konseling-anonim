// Semua interaksi berjalan lokal di browser; tidak ada data yang dikirim atau disimpan.
const form = document.querySelector('#checkin-form');
const insight = document.querySelector('#insight');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const work = values.get('beban');
  const mood = values.get('emosi');
  if (!work || !mood) { insight.textContent = 'Pilih beban kerja dan kondisi emosimu terlebih dahulu.'; return; }
  if (work === 'Kewalahan' || mood === 'Lelah' || mood === 'Cemas') {
    insight.textContent = `Hari ini terasa ${work.toLowerCase()} dan kamu merasa ${mood.toLowerCase()}. Pertimbangkan jeda singkat dan cari dukungan jika diperlukan.`;
  } else {
    insight.textContent = `Hari ini terasa ${work.toLowerCase()} dan kamu merasa ${mood.toLowerCase()}. Perhatikan hal-hal yang membantu menjaga keseimbanganmu.`;
  }
});

// Cek tingkat stres: berjalan lokal, tidak ada data yang disimpan atau dikirim.
const QUESTIONS = [
  { t:'Saya merasa kewalahan oleh jumlah pekerjaan yang harus diselesaikan.' },
  { t:'Saya sulit berhenti memikirkan pekerjaan di luar jam kerja.' },
  { t:'Saya merasa tegang atau mudah tersinggung tanpa sebab yang jelas.' },
  { t:'Saya sulit tidur karena pikiran tentang pekerjaan.' },
  { t:'Saya merasa lelah secara fisik atau emosional, bahkan setelah beristirahat.' },
  { t:'Saya sulit berkonsentrasi atau mudah lupa saat bekerja.' },
  { t:'Tenggat waktu atau target kerja membuat saya merasa tertekan.' },
  { t:'Saya menjauh dari rekan atau teman karena merasa tidak punya energi.' },
  { t:'Saya merasa mampu mengendalikan hal-hal penting dalam pekerjaan saya.', rev:true },
  { t:'Saya punya waktu untuk beristirahat dan melakukan hal yang saya nikmati.', rev:true }
];
const SCALE = ['Tidak pernah','Jarang','Kadang-kadang','Sering','Hampir selalu'];
const LEVELS = [
  { max:13, cls:'level-low', title:'Tingkat stres rendah', text:'Tekananmu belakangan ini tampak masih terkendali. Pertahankan hal-hal yang sudah membantumu.',
    tips:['Jaga jam tidur dan waktu istirahat yang sudah berjalan baik.','Catat apa yang membantumu tetap seimbang, supaya mudah diulang saat sibuk.','Lakukan check-in harian untuk melihat perubahan lebih awal.'] },
  { max:26, cls:'level-mid', title:'Tingkat stres sedang', text:'Ada tanda tekanan yang mulai terasa. Ini saat yang baik untuk memberi ruang pada dirimu sebelum menumpuk.',
    tips:['Pilih satu atau dua prioritas hari ini, dan tunda sisanya jika memungkinkan.','Ambil jeda singkat di sela kerja, misalnya berjalan sebentar atau menarik napas dalam.','Ceritakan bebanmu kepada orang yang kamu percaya.'] },
  { max:40, cls:'level-high', title:'Tingkat stres tinggi', text:'Tekananmu terasa berat belakangan ini, dan kamu tidak perlu menanggungnya sendirian.',
    tips:['Pertimbangkan berbicara dengan psikolog atau tenaga kesehatan.','Lihat apakah ada beban kerja yang bisa dibagi, ditunda, atau dibicarakan dengan atasan.','Prioritaskan tidur, makan teratur, dan waktu pulih di luar jam kerja.'] }
];
const stressForm = document.querySelector('#stress-form');
const qBox = document.querySelector('#questions');
const qCount = document.querySelector('#quiz-count');
const qBar = document.querySelector('#quiz-bar');
const qError = document.querySelector('#quiz-error');
const qResult = document.querySelector('#quiz-result');
QUESTIONS.forEach((q, i) => {
  const fs = document.createElement('fieldset'); fs.className = 'q';
  const lg = document.createElement('legend'); lg.textContent = (i + 1) + '. ' + q.t; fs.appendChild(lg);
  const opts = document.createElement('div'); opts.className = 'options';
  SCALE.forEach((label, v) => {
    const l = document.createElement('label'); l.className = 'option';
    const inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'q' + i; inp.value = v;
    const sp = document.createElement('span'); sp.textContent = label;
    l.append(inp, sp); opts.appendChild(l);
  });
  fs.appendChild(opts); qBox.appendChild(fs);
});
const quizStart = document.querySelector('#quiz-start');
const quizBody = document.querySelector('#quiz-body');
quizStart.addEventListener('click', () => {
  quizBody.hidden = false;
  quizStart.parentElement.hidden = true;
  quizStart.setAttribute('aria-expanded', 'true');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  quizBody.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  qBox.querySelector('input').focus({ preventScroll: true });
});
function answeredCount() { return QUESTIONS.filter((_, i) => stressForm.querySelector('input[name="q' + i + '"]:checked')).length; }
stressForm.addEventListener('change', (e) => {
  const n = answeredCount();
  qCount.textContent = n + ' dari ' + QUESTIONS.length + ' terjawab';
  qBar.style.width = (n / QUESTIONS.length * 100) + '%';
  e.target.closest('.q')?.classList.remove('missing');
  if (n === QUESTIONS.length) qError.hidden = true;
});
stressForm.addEventListener('submit', (event) => {
  event.preventDefault();
  let total = 0; const missing = [];
  QUESTIONS.forEach((q, i) => {
    const c = stressForm.querySelector('input[name="q' + i + '"]:checked');
    if (!c) { missing.push(i); return; }
    const v = Number(c.value); total += q.rev ? 4 - v : v;
  });
  qBox.querySelectorAll('.q').forEach((el, i) => el.classList.toggle('missing', missing.includes(i)));
  if (missing.length) {
    qError.textContent = 'Masih ada ' + missing.length + ' pernyataan yang belum dijawab.';
    qError.hidden = false; qResult.hidden = true;
    qBox.querySelectorAll('.q')[missing[0]].querySelector('input').focus();
    return;
  }
  qError.hidden = true;
  const lvl = LEVELS.find(l => total <= l.max);
  const max = QUESTIONS.length * 4;
  qResult.className = 'quiz-result ' + lvl.cls;
  qResult.innerHTML =
    '<span class="pill">Skor ' + total + ' dari ' + max + '</span>' +
    '<h3>' + lvl.title + '</h3>' +
    '<div class="meter" role="img" aria-label="Skor ' + total + ' dari ' + max + '"><i style="width:' + (total / max * 100) + '%"></i></div>' +
    '<p>' + lvl.text + '</p>' +
    '<p><strong>Yang bisa kamu coba</strong></p><ul>' + lvl.tips.map(t => '<li>' + t + '</li>').join('') + '</ul>' +
    '<div class="actions"><a class="button" href="#ruang-konseling">Mulai konseling anonim</a></div>' +
    '<p class="small muted" style="margin:20px 0 0">Ini skrining mandiri, bukan diagnosis. Batas skor bersifat ilustrasi dan belum divalidasi secara klinis. Jika kamu ingin menyakiti diri sendiri atau berada dalam keadaan darurat, hubungi <strong>119 ekstensi 8</strong> (Healing119 dari Kemenkes, healing119.id) atau orang terdekat sekarang.</p>';
  qResult.hidden = false;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  qResult.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' });
  qResult.focus({ preventScroll: true });
});
document.querySelector('#quiz-reset').addEventListener('click', () => {
  stressForm.reset();
  qBox.querySelectorAll('.q').forEach(el => el.classList.remove('missing'));
  qCount.textContent = '0 dari ' + QUESTIONS.length + ' terjawab'; qBar.style.width = '0';
  qError.hidden = true; qResult.hidden = true;
});

// Ruang konseling anonim (simulasi): semua berjalan di browser dan tidak ada yang disimpan.
const roomStart = document.querySelector('#room-start');
const roomChat = document.querySelector('#room-chat');
const roomForm = document.querySelector('#room-form');
const roomCode = document.querySelector('#room-code');
const roomCodeChat = document.querySelector('#room-code-chat');
const roomTopic = document.querySelector('#room-topic');
const roomError = document.querySelector('#room-error');
const roomNotice = document.querySelector('#room-notice');
const chatLog = document.querySelector('#chat-log');
const chatInput = document.querySelector('#chat-input');
const chatTyping = document.querySelector('#chat-typing');
const chatPii = document.querySelector('#chat-pii');
const chatCrisis = document.querySelector('#chat-crisis');
const composer = document.querySelector('#composer');
const WORDS_A = ['Embun','Senja','Fajar','Rimbun','Telaga','Pelangi','Awan','Cemara','Lembayung','Kenanga'];
const WORDS_B = ['Teduh','Tenang','Lembut','Jernih','Hangat','Sabar','Damai','Syahdu','Sejuk','Tulus'];
const IDLE_MS = 10 * 60 * 1000;
const GREET = {
  'Stres kerja': 'Halo, selamat datang. Kamu bisa menceritakan tekanan kerja yang sedang kamu rasakan, sebanyak atau sesedikit yang kamu mau.',
  'Batas jam kerja': 'Halo, selamat datang. Ceritakan saja bagaimana jam kerja dan waktu pribadimu terasa belakangan ini.',
  'Konflik tim': 'Halo, selamat datang. Kamu bisa menceritakan situasi dengan timmu tanpa perlu menyebut nama siapa pun.',
  'Masalah pribadi': 'Halo, selamat datang. Ruang ini untukmu bercerita apa pun yang sedang kamu pikirkan, dengan kecepatanmu sendiri.'
};
const FOLLOW = [
  'Terima kasih sudah bercerita. Dari yang kamu tulis, terdengar ini cukup menguras tenaga. Bagian mana yang paling terasa berat akhir-akhir ini?',
  'Aku mendengarmu. Sejak kapan perasaan ini mulai terasa, dan apa yang biasanya membuatnya sedikit lebih ringan?',
  'Kamu sudah melakukan hal baik dengan mengungkapkannya. Kalau kamu mau, kita bisa memilih satu hal kecil yang bisa dicoba minggu ini.',
  'Silakan lanjutkan. Aku di sini dan tidak terburu-buru.'
];
const CRISIS_RE = /bunuh diri|mengakhiri hidup|akhiri hidup|ingin mati|pengen mati|menyakiti diri|melukai diri|tidak ingin hidup|nggak mau hidup|gak mau hidup/i;
const CRISIS_REPLY = 'Terima kasih sudah menuliskannya. Keselamatanmu yang utama sekarang. Ini hanya simulasi, jadi tidak ada orang sungguhan yang membaca pesanmu. Tolong hubungi 119 ekstensi 8 (Healing119 dari Kemenkes) atau orang terdekat sekarang.';
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /\+?\d(?:[\s.-]?\d){8,14}/;
const URL_RE = /https?:\/\/\S+|www\.\S+/i;
let currentCode = '', idleTimer = null, replyTimer = null, turn = 0, pendingText = null, lastEsc = 0;

function randomInts(n) {
  const arr = new Uint32Array(n);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
  else for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * 4294967295);
  return arr;
}
function setCode() {
  const r = randomInts(3);
  currentCode = WORDS_A[r[0] % WORDS_A.length] + WORDS_B[r[1] % WORDS_B.length] + '#' + (100 + r[2] % 900);
  roomCode.textContent = currentCode;
}
function addMsg(role, text) {
  const el = document.createElement('div'); el.className = 'msg ' + role;
  const who = document.createElement('span'); who.className = 'who';
  who.textContent = role === 'me' ? currentCode : 'Psikolog (simulasi)';
  el.append(who, document.createTextNode(text));
  chatLog.appendChild(el); chatLog.scrollTop = chatLog.scrollHeight;
}
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => wipe('Sesi dihapus karena tidak ada aktivitas selama 10 menit.'), IDLE_MS);
}
function wipe(message) {
  clearTimeout(replyTimer); clearTimeout(idleTimer);
  chatLog.replaceChildren(); chatInput.value = '';
  chatPii.hidden = true; chatCrisis.hidden = true; chatTyping.hidden = true;
  pendingText = null; turn = 0;
  roomForm.reset(); roomError.hidden = true;
  roomChat.hidden = true; roomStart.hidden = false;
  setCode();
  roomNotice.textContent = message || ''; roomNotice.hidden = !message;
  if (message) roomNotice.focus({ preventScroll: true });
}
// Kosongkan untuk kembali ke beranda situs ini. Isi dengan alamat lain (mis. situs netral) jika diinginkan.
const QUICK_EXIT_URL = '';
function quickExit() {
  wipe();
  // replace(): halaman ruang konseling tidak tersisa di riwayat, jadi tombol Back tidak membukanya lagi.
  window.location.replace(QUICK_EXIT_URL || window.location.pathname + window.location.search);
}
function findPII(text) {
  const found = [];
  if (EMAIL_RE.test(text)) found.push('alamat email');
  if (PHONE_RE.test(text)) found.push('nomor telepon');
  if (URL_RE.test(text)) found.push('tautan');
  return found;
}
function maskPII(text) {
  return text
    .replace(new RegExp(EMAIL_RE.source, 'g'), '[email disamarkan]')
    .replace(new RegExp(URL_RE.source, 'gi'), '[tautan disamarkan]')
    .replace(new RegExp(PHONE_RE.source, 'g'), '[nomor disamarkan]');
}
function deliver(text) {
  chatPii.hidden = true; pendingText = null;
  addMsg('me', text); chatInput.value = ''; resetIdle();
  const crisis = CRISIS_RE.test(text);
  if (crisis) chatCrisis.hidden = false;
  clearTimeout(replyTimer); chatTyping.hidden = false;
  replyTimer = setTimeout(() => {
    chatTyping.hidden = true;
    addMsg('them', crisis ? CRISIS_REPLY : FOLLOW[turn++ % FOLLOW.length]);
  }, 1100);
}
function trySend() {
  const text = chatInput.value.trim();
  if (!text) return;
  const found = findPII(text);
  if (found.length) {
    pendingText = text;
    chatPii.querySelector('.pii-msg').textContent = 'Pesanmu tampak memuat ' + found.join(' dan ') + '. Menyamarkannya membantu menjaga identitasmu tetap anonim.';
    chatPii.hidden = false; resetIdle(); return;
  }
  deliver(text);
}
setCode();
document.querySelector('#code-shuffle').addEventListener('click', setCode);
roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const topic = new FormData(roomForm).get('topik');
  if (!topic) { roomError.hidden = false; return; }
  roomError.hidden = true; roomNotice.hidden = true;
  roomStart.hidden = true; roomChat.hidden = false;
  roomCodeChat.textContent = currentCode; roomTopic.textContent = 'Topik: ' + topic;
  addMsg('them', GREET[topic]); resetIdle(); chatInput.focus();
});
roomForm.addEventListener('change', () => { roomError.hidden = true; });
composer.addEventListener('submit', (event) => { event.preventDefault(); trySend(); });
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); trySend(); }
});
chatPii.addEventListener('click', (event) => {
  const act = event.target.dataset && event.target.dataset.act;
  if (!act || pendingText === null) return;
  if (act === 'mask') deliver(maskPII(pendingText));
  else if (act === 'send') deliver(pendingText);
  else { chatPii.hidden = true; chatInput.focus(); }
});
roomChat.addEventListener('input', resetIdle);
document.querySelector('#room-wipe').addEventListener('click', () => wipe('Percakapan dihapus dari layar. Tidak ada yang tersimpan.'));
document.querySelector('#room-exit').addEventListener('click', quickExit);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || roomChat.hidden) return;
  const now = Date.now();
  if (now - lastEsc < 800) quickExit();
  lastEsc = now;
});
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduced) {
  const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
  }), { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}
