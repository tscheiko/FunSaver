// Pfad zu deinem Sound
const PING_SRC = 'sounds/ping.mp3';

// Kleiner Pool, damit schnelle Klicks nicht „schlucken“
const POOL_SIZE = 6;
const pool = Array.from({ length: POOL_SIZE }, () => {
  const a = new Audio(PING_SRC);
  a.preload = 'auto';
  a.volume = 0.6; // ggf. 0.3–0.8
  return a;
});
let i = 0;

// globaler Mute-Toggle (falls du später willst)
let isMuted = false;

// Spielt den Ping ab
function playPing() {
  if (isMuted) return;
  const a = pool[i];
  try {
    // schneller Re-Start
    a.currentTime = 0;
    // Manche Browser brauchen ein .play() in Klick-Handlern – passt hier
    a.play();
  } catch {}
  i = (i + 1) % POOL_SIZE;
}

// Auf *jeden* Klick der Seite reagieren (auch Links, Divs, etc.)
window.addEventListener('click', playPing, { capture: true });

// Optional: Tastatur-Enter/Space ebenfalls pingen (Barrierefreiheit)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') playPing();
});

// Exporte (falls du irgendwo stumm schalten willst)
window.funSaverSound = {
  mute()  { isMuted = true; },
  unmute(){ isMuted = false; },
  toggle(){ isMuted = !isMuted; }
};
