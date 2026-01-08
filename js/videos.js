// js/videos.js
(async () => {
  const endpoint = 'videos.php';

  const main = document.getElementById('mainVideo');
  const thumbs = document.getElementById('thumbs');
  if (!main || !thumbs) return;

  const showError = (msg) => {
    console.error(msg);
    thumbs.innerHTML = `
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#4a0000;border:1px solid #a22;color:#fff;">
        ${msg}
      </div>`;
  };

  const setMain = (url) => {
    main.pause();
    main.src = url;
    main.load();
  };

  const makeThumbCard = (it, label, isActive = false) => {
    const btn = document.createElement('button');
    btn.className = 'thumb' + (isActive ? ' active' : '');
    btn.type = 'button';

    // Thumb Video: keine Controls, muted, loop -> dient als "moving thumbnail"
    // Wenn du wirklich ein statisches Thumbnail willst, sag’s: dann machen wir poster frames / server thumbs.
    const v = document.createElement('video');
    v.src = it.url;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'metadata';

    // Damit es auf Mobile nicht blockiert: muted + autoplay versuchen
    v.autoplay = true;

    const media = document.createElement('div');
    media.className = 'thumb-media';
    media.appendChild(v);

    const badge = document.createElement('div');
    badge.className = 'play-badge';
    badge.innerHTML = `
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="20" stroke="white" stroke-width="2" opacity="0.9"/>
        <path d="M23 18 L36 26 L23 34 Z" fill="white" opacity="0.9"/>
      </svg>
    `;
    media.appendChild(badge);

    const text = document.createElement('div');
    text.className = 'label';
    text.textContent = label;

    btn.appendChild(media);
    btn.appendChild(text);

    btn.addEventListener('click', () => {
      setMain(it.url);
      [...thumbs.children].forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      // Optional: beim Wechsel nach oben scrollen
      // main.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Autoplay Versuch (manche Browser starten erst nach User-Interaction)
    v.play().catch(() => { /* ok */ });

    return btn;
  };

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API HTTP ${res.status}`);

    const data = await res.json();
    const items = data?.videos || [];

    if (!Array.isArray(items) || items.length === 0) {
      showError('Keine Videos gefunden.');
      return;
    }

    // Groß = neuestes
    setMain(items[0].url);

    thumbs.innerHTML = '';

    // Thumbs: nächste 4
    items.slice(1, 5).forEach((it, idx) => {
      const label = `Video ${idx + 2}`;
      thumbs.appendChild(makeThumbCard(it, label, false));
    });

  } catch (err) {
    showError(`Videos laden fehlgeschlagen: ${err.message}`);
  }
})();
