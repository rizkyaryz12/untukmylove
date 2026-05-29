/**
 * script.js — Cinematic Emotional Storytelling Website
 *
 * Dependencies (via CDN, loaded in index.html):
 *   - GSAP 3.12 + ScrollTrigger
 *   - Lenis 1.0 (smooth scroll)
 *
 * Sections:
 *   1. Grain canvas
 *   2. Preloader
 *   3. Lenis smooth scroll
 *   4. GSAP ScrollTrigger reveals
 *   5. Parallax backgrounds
 *   6. Enter button / audio unlock
 *   7. Chapter 2 — thoughts & silence
 *   8. Chapter 3 — chat typing animation
 *   9. Ending sequence
 *  10. VHS static canvas (ch2)
 *  11. Audio helpers
 */

/* ─────────────────────────────────────────────────────────
   Wait for scripts to be ready
───────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  initGrain();
  initPreloader();
  // GSAP + Lenis load asynchronously via CDN, so we poll
  waitForLibs(main);
});

function waitForLibs(cb) {
  if (window.gsap && window.ScrollTrigger && window.Lenis) {
    cb();
  } else {
    setTimeout(() => waitForLibs(cb), 80);
  }
}

/* ═══════════════════════════════════════════════════════════
   1. GRAIN CANVAS
   Draws animated film grain on a fixed canvas overlay.
══════════════════════════════════════════════════════════ */
function initGrain() {
  const canvas = document.getElementById('grain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let frame = 0;
  function drawGrain() {
    frame++;
    // Only redraw every 2 frames for performance
    if (frame % 2 === 0) {
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255 | 0;
        data[i]   = v;
        data[i+1] = v;
        data[i+2] = v;
        // alpha — keep low for subtle effect
        data[i+3] = Math.random() * 18 | 0;
      }
      ctx.putImageData(imageData, 0, 0);
    }
    requestAnimationFrame(drawGrain);
  }
  requestAnimationFrame(drawGrain);
}

/* ═══════════════════════════════════════════════════════════
   2. PRELOADER
══════════════════════════════════════════════════════════ */
function initPreloader() {
  const pre = document.getElementById('preloader');
  setTimeout(() => {
    pre.classList.add('hidden');
  }, 2600);
}

/* ═══════════════════════════════════════════════════════════
   MAIN — runs after all libs ready
══════════════════════════════════════════════════════════ */
function main() {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();
  initRevealElements();
  initParallax();
  initEnterButton();
  initChapter2();
  initChapter3();
  initEndingSequence();
  initVHSStatic();
}

/* ═══════════════════════════════════════════════════════════
   3. LENIS SMOOTH SCROLL
══════════════════════════════════════════════════════════ */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  // Sync Lenis with GSAP ticker
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Expose globally so other fns can pause/resume
  window._lenis = lenis;
}

/* ═══════════════════════════════════════════════════════════
   4. SCROLL REVEAL ELEMENTS
   Watches .reveal elements and adds .in-view class.
══════════════════════════════════════════════════════════ */
function initRevealElements() {
  const reveals = document.querySelectorAll('.reveal');

  reveals.forEach((el, i) => {
    // Stagger siblings within same parent
    const siblings = el.parentElement.querySelectorAll('.reveal');
    const idx = Array.from(siblings).indexOf(el);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      onEnter: () => {
        setTimeout(() => el.classList.add('in-view'), idx * 160);
      },
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   5. PARALLAX BACKGROUNDS
══════════════════════════════════════════════════════════ */
function initParallax() {
  document.querySelectorAll('.parallax').forEach((el) => {
    const section = el.closest('section');
    if (!section) return;

    gsap.to(el, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   6. ENTER BUTTON
   On click: unlock audio, reveal story, fade opening.
══════════════════════════════════════════════════════════ */
function initEnterButton() {
  const btn   = document.getElementById('enter-btn');
  const story = document.getElementById('story');
  const opening = document.getElementById('opening');

  btn.addEventListener('click', () => {
    // Unlock audio context (required by browsers)
    unlockAudio();

    // Fade opening out
    gsap.to(opening, {
      opacity: 0,
      duration: 1.6,
      ease: 'power2.inOut',
      onComplete: () => {
        opening.style.display = 'none';
      },
    });

    // Reveal story with slight delay
    setTimeout(() => {
      story.classList.add('visible');
      story.removeAttribute('aria-hidden');
    }, 800);

    // Start rain + piano
    fadeInAudio('a-rain', 0.45, 2000);
    fadeInAudio('a-piano', 0.25, 3000);
  });
}

/* ═══════════════════════════════════════════════════════════
   7. CHAPTER 2 — INSIDE MY HEAD
   Shows floating thoughts via ScrollTrigger, then clears
   them and shows the silence block.
══════════════════════════════════════════════════════════ */
function initChapter2() {
  const ch2      = document.getElementById('ch2');
  const thoughts = document.querySelectorAll('.t');
  const silence  = document.getElementById('silence-block');
  const staticCv = document.getElementById('static-cv');

  if (!ch2) return;

  let thoughtsShown = false;

  ScrollTrigger.create({
    trigger: ch2,
    start: 'top 50%',
    onEnter: () => {
      if (thoughtsShown) return;
      thoughtsShown = true;

      // Activate VHS static
      staticCv.classList.add('active');

      // Show heartbeat audio
      fadeInAudio('a-heartbeat', 0.2, 1000);

      // Reveal thoughts one by one
      thoughts.forEach((t, i) => {
        setTimeout(() => {
          t.classList.add('visible');
          // Subtle tremble
          gsap.fromTo(t,
            { x: 0, y: 0 },
            { x: () => (Math.random() - 0.5) * 6,
              y: () => (Math.random() - 0.5) * 4,
              duration: 3,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            }
          );
        }, i * 480);
      });

      // Silence moment — hide thoughts, show sentence
      setTimeout(() => {
        thoughts.forEach((t) => {
          gsap.to(t, { opacity: 0, duration: 0.6 });
        });
        staticCv.classList.remove('active');
        fadeOutAudio('a-heartbeat', 1500);

        setTimeout(() => {
          silence.classList.add('visible');
        }, 800);
      }, thoughts.length * 480 + 2200);
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   8. CHAPTER 3 — THE UNSENT MESSAGES
   Types messages in the fake chat UI, deletes them,
   ends with "last seen" status.
══════════════════════════════════════════════════════════ */
function initChapter3() {
  const ch3 = document.getElementById('ch3');
  if (!ch3) return;

  let started = false;

  ScrollTrigger.create({
    trigger: ch3,
    start: 'top 50%',
    onEnter: () => {
      if (started) return;
      started = true;
      runChatSequence();
    },
  });
}

function runChatSequence() {
  const inpText  = document.getElementById('inp-text');
  const msgs     = document.getElementById('messages');
  const status   = document.getElementById('contact-status');

  // sequence: [text, action] action: 'delete' | 'send' | 'unsent'
  const sequence = [
    { text: 'kamu masih sayang aku?',          action: 'delete' },
    { text: 'maaf aku ovt lagi',               action: 'delete' },
    { text: 'aku cuma takut kehilangan kamu',  action: 'unsent' },
  ];

  let delay = 500;

  sequence.forEach((item, idx) => {
    // Type it
    delay += typeInInput(inpText, item.text, delay);
    delay += 600; // pause

    if (item.action === 'delete') {
      // Delete character by character
      delay += deleteInput(inpText, delay);
      delay += 400;
    } else if (item.action === 'send') {
      // Send as bubble
      const d = delay;
      setTimeout(() => {
        sendMessage(msgs, item.text);
        inpText.textContent = '';
        playTypingSound();
      }, d);
      delay += 300;
    } else if (item.action === 'unsent') {
      // Show "not sent" bubble, then mark deleted
      const d = delay;
      setTimeout(() => {
        const bubble = sendMessage(msgs, item.text);
        inpText.textContent = '';
        setTimeout(() => {
          bubble.classList.add('deleted');
          bubble.textContent = 'pesan dihapus';
        }, 2000);
      }, d);
      delay += 2400;
    }
  });

  // Blinking cursor remains, status updates
  setTimeout(() => {
    status.textContent = 'last seen 2:41 AM';
  }, delay + 600);
}

/**
 * Types text into the input field character by character.
 * Returns total duration in ms.
 */
function typeInInput(el, text, startDelay) {
  const charDelay = 80;
  let totalDuration = 0;

  for (let i = 0; i <= text.length; i++) {
    const d = startDelay + i * charDelay;
    const char = text.slice(0, i);
    setTimeout(() => { el.textContent = char; }, d);
    totalDuration = i * charDelay;
  }
  return totalDuration;
}

/**
 * Deletes text from input field character by character.
 * Returns total duration in ms.
 */
function deleteInput(el, startDelay) {
  const charDelay = 55;
  const len = el.textContent.length;

  for (let i = len; i >= 0; i--) {
    const d = startDelay + (len - i) * charDelay;
    const char = el.textContent.slice(0, i);
    setTimeout(() => { el.textContent = char; }, d);
  }
  return len * charDelay;
}

/**
 * Creates a message bubble and appends to messages container.
 * Returns the bubble element.
 */
function sendMessage(container, text) {
  const bubble = document.createElement('div');
  bubble.classList.add('msg');
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function playTypingSound() {
  const audio = document.getElementById('a-typing');
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }
}

/* ═══════════════════════════════════════════════════════════
   9. ENDING SEQUENCE
   Reveals ending lines one by one on scroll, then fades
   photo to black, shows secret message.
══════════════════════════════════════════════════════════ */
function initEndingSequence() {
  const ending    = document.getElementById('ending');
  const endingImg = document.getElementById('ending-img');
  const endingOv  = document.getElementById('ending-ov');
  const finalBlk  = document.getElementById('final-black');
  const secret    = document.getElementById('secret');
  const lines     = [
    document.getElementById('el1'),
    document.getElementById('el2'),
    document.getElementById('el3'),
    document.getElementById('el4'),
  ];

  if (!ending) return;

  let triggered = false;

  ScrollTrigger.create({
    trigger: ending,
    start: 'top 55%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      // Stop piano, keep rain
      fadeOutAudio('a-piano', 3000);

      // Show lines with delays
      const lineDelays = [0, 2400, 4400, 6600];
      lines.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => { el.classList.add('show'); }, lineDelays[i]);
      });

      // After last line: dissolve photo, fade to black
      setTimeout(() => {
        // Photo distortion
        gsap.to(endingImg, {
          filter: 'brightness(.2) blur(14px)',
          duration: 4,
          ease: 'power2.inOut',
        });
        gsap.to(endingOv, {
          background: 'rgba(0,0,0,.85)',
          duration: 4,
          ease: 'power2.inOut',
        });
      }, 9000);

      setTimeout(() => {
        finalBlk.classList.add('fade-in');
        fadeOutAudio('a-rain', 5000);
      }, 12500);

      // Secret ending — appears after 10s of black
      setTimeout(() => {
        secret.classList.add('show');
        setTimeout(() => { secret.classList.remove('show'); }, 4000);
      }, 24000);
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   10. VHS STATIC CANVAS (Chapter 2)
   Draws animated white noise on a canvas.
══════════════════════════════════════════════════════════ */
function initVHSStatic() {
  const cv  = document.getElementById('static-cv');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  function resize() {
    cv.width  = cv.offsetWidth;
    cv.height = cv.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    if (cv.classList.contains('active')) {
      const w = cv.width, h = cv.height;
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() > 0.5 ? 255 : 0;
        img.data[i] = img.data[i+1] = img.data[i+2] = v;
        img.data[i+3] = Math.random() * 30 | 0;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════════════
   11. AUDIO HELPERS
   All audio is gated behind user interaction (enter button).
══════════════════════════════════════════════════════════ */
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Play and immediately pause to satisfy browser policy
  document.querySelectorAll('audio').forEach((a) => {
    a.play().then(() => a.pause()).catch(() => {});
  });
}

/**
 * Fade in an audio element over `ms` milliseconds.
 */
function fadeInAudio(id, targetVol, ms) {
  const audio = document.getElementById(id);
  if (!audio) return;
  audio.volume = 0;
  audio.play().catch(() => {});

  const steps    = 30;
  const stepTime = ms / steps;
  const step     = targetVol / steps;
  let count = 0;
  const iv = setInterval(() => {
    count++;
    audio.volume = Math.min(targetVol, audio.volume + step);
    if (count >= steps) clearInterval(iv);
  }, stepTime);
}

/**
 * Fade out an audio element over `ms` milliseconds.
 */
function fadeOutAudio(id, ms) {
  const audio = document.getElementById(id);
  if (!audio) return;
  const startVol = audio.volume;
  const steps    = 30;
  const stepTime = ms / steps;
  const step     = startVol / steps;
  let count = 0;
  const iv = setInterval(() => {
    count++;
    audio.volume = Math.max(0, audio.volume - step);
    if (count >= steps) {
      clearInterval(iv);
      audio.pause();
    }
  }, stepTime);
}
