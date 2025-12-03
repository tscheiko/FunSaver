// js/videos.js — lädt Videos aus videos.php (DB)

(async () => {
  const endpoint = 'videos.php'; // ← Deine funktionierende API

  const main = document.getElementById('mainVideo');
  const thumbs = document.getElementById('thumbs');
  if (!main || !thumbs) return;

  const setMain = (url) => {
    main.src = url;
    main.play().catch(() => {});
  };

  const showError = (msg) => {
    console.error(msg);
    thumbs.innerHTML = `
      <div style="
        margin-top:12px;
        padding:12px;
        border-radius:10px;
        background:#4a0000;
        border:1px solid #a22;
        color:#fff;
      ">
        ${msg}
      </div>`;
  };

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`API HTTP ${res.status}`);

    const data = await res.json();
    const items = data.videos;

    if (!Array.isArray(items) || items.length === 0) {
      showError("Keine Videos gefunden.");
      return;
    }

    // === Großes Video (NEUSTES)
    setMain(items[0].url);

    // === Thumbnails (max 4 weitere)
    thumbs.innerHTML = "";
    items.slice(1, 5).forEach((it, index) => {
      const btn = document.createElement("button");
      btn.className = "thumb";
      btn.type = "button";
      btn.textContent = `Video ${it.id}`;
      btn.onclick = () => {
        setMain(it.url);
        [...thumbs.children].forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
      };
      thumbs.appendChild(btn);
    });

  } catch (err) {
    showError(`Videos laden fehlgeschlagen: ${err.message}`);
  }
})();
