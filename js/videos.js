// js/videos.js
(async () => {
  const endpoint = 'videos.php'; // ✅ liegt im Root

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
    main.src = url;
    main.load();
    // optional: autoplay wenn muted
    // main.muted = true;
    // main.play().catch(()=>{});
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

    // ✅ großes Video = erstes Element (dein SQL macht ORDER BY timestamp DESC)
    setMain(items[0].url);

    // ✅ Thumbnails-Buttons (nächste 4)
    thumbs.innerHTML = '';
    items.slice(1, 5).forEach((it, idx) => {
      const btn = document.createElement('button');
      btn.className = 'thumb';
      btn.type = 'button';
      btn.textContent = `Video ${idx + 2}`;
      btn.onclick = () => {
        setMain(it.url);
        [...thumbs.children].forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
      };
      thumbs.appendChild(btn);
    });

  } catch (err) {
    showError(`Videos laden fehlgeschlagen: ${err.message}`);
  }
})();
