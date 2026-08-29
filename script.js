(function () {
  'use strict';

  /* =========================================================
     GANTI PATH FILE AUDIO DI SINI
     ========================================================= */
  const AUDIO_SRC = 'angel.mp3'; // <-- ganti dengan path file lagu "Massive Attack - Angel" milikmu

  const audioEl = document.getElementById('bg-audio');
  audioEl.src = AUDIO_SRC;

  const CORRECT_PIN = '040911';

  const screens = {
    pin: document.getElementById('pin-screen'),
    chat: document.getElementById('chat-screen'),
    rain: document.getElementById('rain-screen'),
    end: document.getElementById('end-screen'),
  };

  function goTo(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  /* ================= PIN LOGIC ================= */
  let entered = '';
  const dotsRow = document.getElementById('dots-row');
  const dots = Array.from(dotsRow.children);
  const pinFrame = document.getElementById('pin-frame');
  const warningMsg = document.getElementById('warning-msg');
  const numpad = document.getElementById('numpad');

  function renderDots() {
    dots.forEach((d, i) => d.classList.toggle('filled', i < entered.length));
  }

  function showWarning() {
    warningMsg.classList.add('show');
    pinFrame.classList.add('shake');
    setTimeout(() => pinFrame.classList.remove('shake'), 450);
    setTimeout(() => {
      warningMsg.classList.remove('show');
    }, 1200);
  }

  function checkPin() {
    if (entered === CORRECT_PIN) {
      setTimeout(() => {
        goTo('chat');
        startChat();
      }, 250);
    } else {
      showWarning();
      setTimeout(() => {
        entered = '';
        renderDots();
      }, 400);
    }
  }

  numpad.addEventListener('click', (e) => {
    const key = e.target.closest('.npkey');
    if (!key) return;
    const k = key.dataset.k;

    key.classList.add('tap');
    setTimeout(() => key.classList.remove('tap'), 150);

    if (k === 'clear') {
      entered = '';
      renderDots();
      return;
    }
    if (k === 'back') {
      entered = entered.slice(0, -1);
      renderDots();
      return;
    }
    if (entered.length >= 6) return;
    entered += k;
    renderDots();
    if (entered.length === 6) {
      checkPin();
    }
  });

  // dukungan keyboard fisik (desktop)
  window.addEventListener('keydown', (e) => {
    if (!screens.pin.classList.contains('active')) return;
    if (/^[0-9]$/.test(e.key) && entered.length < 6) {
      entered += e.key;
      renderDots();
      if (entered.length === 6) checkPin();
    } else if (e.key === 'Backspace') {
      entered = entered.slice(0, -1);
      renderDots();
    }
  });

  /* ================= CHAT LOGIC ================= */
  const chatBody = document.getElementById('chat-body');
  const btnContinue = document.getElementById('btn-continue');

  const SCRIPT = [
    { who: 'left', text: 'aku mau ngomong' },
    { who: 'right', text: 'aku jugaa' },
    { who: 'left', text: 'i love you' },
    { who: 'right', text: 'too' },
    { who: 'left', text: 'just "too"?' },
    { who: 'right', text: 'next' },
  ];

  let chatStarted = false;

  function addBubble(who, text) {
    const b = document.createElement('div');
    b.className = 'bubble ' + who;
    b.textContent = text;
    chatBody.appendChild(b);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function startChat() {
    if (chatStarted) return;
    chatStarted = true;
    let delay = 300;
    SCRIPT.forEach((msg, idx) => {
      delay += 900;
      setTimeout(() => {
        addBubble(msg.who, msg.text);
        if (idx === SCRIPT.length - 1) {
          setTimeout(() => btnContinue.classList.add('show'), 500);
        }
      }, delay);
    });
  }

  btnContinue.addEventListener('click', () => {
    audioEl.play().catch(() => {
      // autoplay mungkin diblokir browser; klik ini sudah termasuk gesture user
      // jadi biasanya tetap berhasil. Jika gagal, browser akan menahan sampai
      // interaksi berikutnya.
    });
    goTo('rain');
    startRain();
    startLyrics();
  });

  /* ================= SCREEN 3: MATRIX RAIN ================= */
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let columns, drops, fontSize, rainInterval;

  const GLYPHS = 'アイウエオカキクケコサシスセソ01love∞†×÷'.split('');

  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fontSize = window.innerWidth < 500 ? 14 : 18;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
      const text = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const isBright = Math.random() > 0.94;
      ctx.fillStyle = isBright ? '#FF0000' : '#7a0000';
      ctx.font = fontSize + "px 'Share Tech Mono', monospace";
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let rainStarted = false;
  function startRain() {
    if (rainStarted) {
      return;
    }
    rainStarted = true;
    setupCanvas();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    rainInterval = setInterval(drawMatrix, 55);
  }

  function stopRain() {
    clearInterval(rainInterval);
    rainStarted = false;
  }

  window.addEventListener('resize', () => {
    if (rainStarted) setupCanvas();
  });

  /* ================= SCREEN 3: LYRIC SPAWNER ================= */
  const lyricField = document.getElementById('lyric-field');
  let lyricInterval;
  let climaxTimer;

  const LYRIC_PHRASE = 'love you love you'; // fokus visual utama, sesuai permintaan
  const OBSESSION_DURATION = 22000; // durasi sekuens lirik sebelum masuk ke climax (ms)

  function randPos() {
    const x = 15 + Math.random() * 70; // %
    const y = 15 + Math.random() * 70; // %
    return { x, y };
  }

  function spawnLyric() {
    const node = document.createElement('div');
    node.className = 'lyric-node' + (Math.random() > 0.5 ? ' glitch' : '');
    node.textContent = LYRIC_PHRASE;
    const pos = randPos();
    node.style.left = pos.x + '%';
    node.style.top = pos.y + '%';
    const scale = 0.7 + Math.random() * 0.8;
    node.style.fontSize = 'clamp(16px, ' + 3.5 * scale + 'vw, ' + 40 * scale + 'px)';
    lyricField.appendChild(node);
    setTimeout(() => node.remove(), 3300);
  }

  let lyricsStarted = false;
  function startLyrics() {
    if (lyricsStarted) return;
    lyricsStarted = true;
    spawnLyric();
    // interval kira-kira mengikuti tempo lambat lagu "Angel" (obsesif, berulang)
    lyricInterval = setInterval(spawnLyric, 900);

    // sinkronisasi kasar terhadap progres audio: makin lama lagu jalan,
    // makin rapat & makin intens teksnya (menambah kesan "obsessed")
    audioEl.addEventListener('timeupdate', onAudioProgress);

    // fallback: kalau file audio belum diganti (durasi tidak tersedia),
    // sekuens tetap otomatis berpindah ke climax setelah durasi tertentu
    climaxTimer = setTimeout(triggerClimax, OBSESSION_DURATION);
  }

  function onAudioProgress() {
    if (!audioEl.duration) return;
    const progress = audioEl.currentTime / audioEl.duration;
    if (progress > 0.5 && lyricInterval) {
      clearInterval(lyricInterval);
      lyricInterval = setInterval(spawnLyric, 550);
    }
  }

  function stopLyrics() {
    clearInterval(lyricInterval);
    clearTimeout(climaxTimer);
    audioEl.removeEventListener('timeupdate', onAudioProgress);
    lyricField.innerHTML = '';
    lyricsStarted = false;
  }

  document.getElementById('rain-exit').addEventListener('click', () => {
    triggerClimax();
  });

  /* ================= SCREEN 4: CLIMAX & ENDING ================= */
  const glitchFlash = document.getElementById('glitch-flash');
  const endingTextEl = document.getElementById('ending-text');
  const typeCursor = document.getElementById('type-cursor');
  const btnReplay = document.getElementById('btn-replay');

  const ENDING_LINE = "You're stuck with me now. There's no escape.";
  const ENDING_LINE_ID = 'Kamu terjebak denganku sekarang. Tidak ada jalan keluar.';
  const endingTranslationEl = document.getElementById('ending-translation');
  let climaxTriggered = false;

  function triggerClimax() {
    if (climaxTriggered) return;
    climaxTriggered = true;

    stopLyrics();

    // efek layar berkedip/glitch singkat
    glitchFlash.classList.add('play');

    setTimeout(() => {
      stopRain();
      // audio SENGAJA dibiarkan terus main (autoplay) sampai user klik "Replay Experience"
      glitchFlash.classList.remove('play');
      goTo('end');
      startTyping();
    }, 550);
  }

  function startTyping() {
    endingTextEl.textContent = '';
    endingTranslationEl.textContent = '';
    endingTranslationEl.classList.remove('show');
    typeCursor.classList.remove('hide');
    btnReplay.classList.remove('show');

    let i = 0;
    const speed = 55; // ms per karakter

    function typeStep() {
      if (i < ENDING_LINE.length) {
        endingTextEl.textContent += ENDING_LINE[i];
        i++;
        setTimeout(typeStep, speed);
      } else {
        typeCursor.classList.add('hide');
        setTimeout(() => {
          endingTranslationEl.textContent = ENDING_LINE_ID;
          endingTranslationEl.classList.add('show');
          setTimeout(() => {
            btnReplay.classList.add('show');
          }, 600);
        }, 400);
      }
    }
    typeStep();
  }

  /* ================= REPLAY ================= */
  btnReplay.addEventListener('click', () => {
    // reset semua state ke kondisi awal
    audioEl.pause();
    audioEl.currentTime = 0;

    entered = '';
    renderDots();

    chatBody.innerHTML = '';
    chatStarted = false;
    btnContinue.classList.remove('show');

    stopRain();
    stopLyrics();
    climaxTriggered = false;

    endingTextEl.textContent = '';
    btnReplay.classList.remove('show');

    goTo('pin');
  });
})();
