/* Shareable VHS label. Draws a sticker on a canvas (1200 x 630, so it also works as a social card): the rainbow
   stripe, the 31 for 31 mark, the night and title with the poster, or the whole tape log for My List. Opens in a
   small panel with download, copy and share. Posters are same origin, so the canvas stays clean to export. */
(() => {
  const W = 1200, H = 630, INK = "#14161a", GREEN = "#2ecc6a", MUTED = "#55595f";
  const fontsReady = () => Promise.all([
    document.fonts.load("72px 'Zombie Punks'"), document.fonts.load("400 24px 'Saans Mono'"), document.fonts.load("400 24px 'Saans'"),
  ]).catch(() => {});
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const cache = {};
  const img = (key, src) => cache[key] || (cache[key] = loadImg(src));
  const art = () => Promise.all([
    img("mark", "assets/svg/mark-31-for-31-dark.svg?v=4"),
    img("tape", "assets/img/cassette-top.png"),                          // Meredith's cassette, shot from above, trimmed
    img("sticker", "assets/img/sticker.png"),                            // and the blank crumpled sticker that goes on it
    img("log", "assets/svg/mylist-type-dark.svg?v=2"),                 // "My list" lettering in ink, for the list label (last: the renderers destructure by position)
  ]);
  const pad2 = n => String(n).padStart(2, "0");
  const fit = (x, text, font, max, min = 28) => { let size = parseInt(font); for (; size >= min; size -= 2) { x.font = font.replace(/\d+px/, size + "px"); if (x.measureText(text).width <= max) break; } return size; };
  const dateOf = ts => { const d = new Date(ts); return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`.toUpperCase(); };

  /* The scene: the cassette on a dark table with the sticker stuck across its face, reels peeking either side.
     Returns the sticker's box on the canvas so the text can be laid out inside it. */
  function scene(x, tape, sticker) {
    const g = x.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 760);
    g.addColorStop(0, "#1b1e23"); g.addColorStop(1, "#06070a");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const tw = 1080, th = tape ? tw * tape.height / tape.width : 596, tx = (W - tw) / 2, ty = (H - th) / 2;
    x.save(); x.shadowColor = "rgba(0,0,0,.8)"; x.shadowBlur = 60; x.shadowOffsetY = 24;
    if (tape) x.drawImage(tape, tx, ty, tw, th); else { x.fillStyle = "#0e1013"; x.fillRect(tx, ty, tw, th); }
    x.restore();
    // the sticker across the face, a touch off square like it was stuck on by hand
    const k = tw / 1411, sw = 820 * k, sh = sticker ? sw * sticker.height / sticker.width : sw / 1.678;
    const sx = tx + 690 * k - sw / 2, sy = ty + 160 * k;                    // centred on the face below the top lip
    x.save(); x.translate(sx + sw / 2, sy + sh / 2); x.rotate(-0.006);
    x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 10; x.shadowOffsetY = 3;
    if (sticker) x.drawImage(sticker, -sw / 2, -sh / 2, sw, sh); else { x.fillStyle = "#ece8dc"; x.fillRect(-sw / 2, -sh / 2, sw, sh); }
    x.restore();
    return { x: sx, y: sy, w: sw, h: sh, rot: -0.006 };
  }
  // ink goes on in multiply so the creases of the sticker show through the lettering
  // the layout is drawn at a nominal 773 wide and scaled to whatever the sticker measures
  const NOMINAL = 773;
  function onSticker(x, box, draw) {
    const s = box.w / NOMINAL, nb = { w: NOMINAL, h: box.h / s };
    x.save(); x.translate(box.x + box.w / 2, box.y + box.h / 2); x.rotate(box.rot); x.scale(s, s); x.translate(-nb.w / 2, -nb.h / 2);
    x.globalCompositeOperation = "multiply"; draw(nb); x.restore();
  }
  function stamp(x, text, cx, cy, size = 22) {
    x.save(); x.translate(cx, cy); x.rotate(-0.14); x.font = `700 ${size}px 'Saans Mono'`; x.textAlign = "center"; x.textBaseline = "middle";
    const w = x.measureText(text).width + size * 1.6;
    x.strokeStyle = GREEN; x.lineWidth = size / 6; x.strokeRect(-w / 2, -size * 1.1, w, size * 2.2);
    x.fillStyle = GREEN; x.fillText(text, 0, 1); x.restore();
  }

  async function renderNight(f, watchedAt) {
    await fontsReady();
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const [m, tape, sticker] = await art(); const poster = await loadImg(f.poster);
    const box = scene(x, tape, sticker);
    onSticker(x, box, box => {
      const P = 38, left = P, right = box.w - P;
      if (m) x.drawImage(m, left, 30, 170, 170 * m.height / m.width);
      // the poster, a cut out stuck at the right
      const pw = 118, ph = 177, px = right - pw, py = 28;
      x.save(); x.translate(px + pw / 2, py + ph / 2); x.rotate(0.035); x.translate(-pw / 2, -ph / 2);
      x.globalCompositeOperation = "source-over"; x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 8; x.shadowOffsetY = 3;
      if (poster) x.drawImage(poster, 0, 0, pw, ph); else { x.fillStyle = "#15171b"; x.fillRect(0, 0, pw, ph); }
      x.restore();
      x.fillStyle = INK; x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.font = "400 17px 'Saans Mono'"; x.fillText(`NIGHT ${pad2(f.day)} OF 31`, left, 150);
      const max = right - pw - 28 - left;
      const size = fit(x, f.title, "400 76px 'Zombie Punks'", max, 32);
      x.font = `400 ${size}px 'Zombie Punks'`; x.fillText(f.title, left, 160 + size);
      x.font = "400 16px 'Saans Mono'"; x.fillStyle = MUTED; x.fillText(`${f.year}   ·   DIR. ${f.director.toUpperCase()}`, left, 160 + size + 34);
      // the ruled lines a blank label comes with
      x.strokeStyle = "rgba(20,22,26,.22)"; x.lineWidth = 1;
      for (let i = 0; i < 2; i++) { const yy = box.h - 112 + i * 34; x.beginPath(); x.moveTo(left, yy); x.lineTo(right, yy); x.stroke(); }
      x.fillStyle = MUTED; x.font = "400 15px 'Saans Mono'"; x.textAlign = "left";
      x.fillText("T-120   SP   OCT 2026", left, box.h - 34);
      x.textAlign = "right"; x.fillText("31FOR31", right, box.h - 34);
      if (watchedAt) stamp(x, `WATCHED ${dateOf(watchedAt)}`, box.w * 0.64, box.h - 84, 20);
    });
    return c;
  }

  async function renderList(films, state) {
    await fontsReady();
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const [m, tape, sticker, log] = await art();
    const box = scene(x, tape, sticker);
    const watched = films.filter(f => state.watched[f.slug]);
    onSticker(x, box, box => {
      const P = 38, left = P, right = box.w - P;
      if (m) x.drawImage(m, left, 30, 150, 150 * m.height / m.width);
      x.fillStyle = INK; x.textAlign = "left"; x.textBaseline = "alphabetic";
      if (log) x.drawImage(log, left, 108, 210, 210 * log.height / log.width);   // the "My list" lockup
      else { x.font = "400 17px 'Saans Mono'"; x.fillText("MY TAPE LOG", left, 150); }
      x.font = "400 118px 'Zombie Punks'"; x.fillText(String(watched.length), left, 296);
      x.font = "400 16px 'Saans Mono'"; x.fillStyle = MUTED; x.fillText("OF 31 WATCHED", left, 322);
      // the watched titles in two columns on the right
      const colX = [left + 250, left + 250 + 232], colW = 215, lineH = 19, top = 48, rows = 16;
      x.font = "400 13px 'Saans Mono'";
      if (!watched.length) { x.fillStyle = MUTED; x.fillText("NOTHING TICKED OFF YET.", colX[0], top); }
      watched.slice(0, rows * 2).forEach((f, i) => {
        const col = Math.floor(i / rows), row = i % rows; let t = `${pad2(f.day)}  ${f.title.toUpperCase()}`;
        while (x.measureText(t).width > colW && t.length > 6) t = t.slice(0, -2) + "…";
        x.fillStyle = INK; x.fillText(t, colX[col], top + row * lineH);
      });
      x.fillStyle = MUTED; x.font = "400 15px 'Saans Mono'";
      x.fillText("T-120   SP   OCT 2026", left, box.h - 34);
      x.textAlign = "right"; x.fillText("31FOR31", right, box.h - 34);
      if (watched.length >= 31) stamp(x, "ALL 31. SURVIVED.", box.w * 0.66, box.h - 72, 20);
    });
    return c;
  }

  /* The site card: the same tape with the mark and the premise, for the OG image and anything else that needs it. */
  async function renderSite() {
    await fontsReady();
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const [m, tape, sticker] = await art();
    const box = scene(x, tape, sticker);
    onSticker(x, box, box => {
      const P = 38, left = P, right = box.w - P;
      if (m) x.drawImage(m, left, 40, 400, 400 * m.height / m.width);
      x.fillStyle = INK; x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.font = "400 58px 'Zombie Punks'"; x.fillText("One scary movie a night", left, 304);
      x.font = "400 17px 'Saans Mono'"; x.fillStyle = MUTED; x.fillText("OCTOBER 2026   ·   31 NIGHTS   ·   RATE THEM, FIND THEM, LOG THEM", left, 338);
      x.strokeStyle = "rgba(20,22,26,.22)"; x.lineWidth = 1;
      for (let i = 0; i < 2; i++) { const yy = box.h - 112 + i * 34; x.beginPath(); x.moveTo(left, yy); x.lineTo(right, yy); x.stroke(); }
      x.font = "400 15px 'Saans Mono'"; x.fillText("T-120   SP   OCT 2026", left, box.h - 34);
      x.textAlign = "right"; x.fillText("31FOR31", right, box.h - 34);
    });
    return c;
  }

  /* ---- the panel ---- */
  let panel = null, currentBlob = null, currentName = "";
  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement("div"); panel.className = "label-panel"; panel.id = "label-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Your tape label");
    panel.innerHTML = `<div class="label-card"><button type="button" class="label-close" aria-label="Close">×</button><div class="label-img"></div>
      <div class="label-actions"><button type="button" data-act="download">Download PNG</button><button type="button" data-act="copy">Copy image</button><button type="button" data-act="share" hidden>Share…</button></div>
      <p class="label-note" aria-live="polite"></p></div>`;
    document.body.appendChild(panel);
    panel.addEventListener("click", e => { if (e.target === panel || e.target.closest(".label-close")) close(); });
    const note = panel.querySelector(".label-note");
    panel.querySelector('[data-act="download"]').addEventListener("click", () => { if (window.track) window.track("label", { act: "download" }); const a = document.createElement("a"); a.href = URL.createObjectURL(currentBlob); a.download = currentName; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); note.textContent = "Saved."; });
    panel.querySelector('[data-act="copy"]').addEventListener("click", async () => { if (window.track) window.track("label", { act: "copy" });
      try { await navigator.clipboard.write([new ClipboardItem({ "image/png": currentBlob })]); note.textContent = "Copied to your clipboard."; }
      catch (e) { note.textContent = "Your browser would not copy the image. Download it instead."; }
    });
    panel.querySelector('[data-act="share"]').addEventListener("click", async () => { if (window.track) window.track("label", { act: "share" });
      const file = new File([currentBlob], currentName, { type: "image/png" });
      try { await navigator.share({ files: [file], title: "31 for 31" }); } catch (e) {}
    });
    document.addEventListener("keydown", e => {
      if (!panel.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;                                                 // Tab stays inside the panel
      const f = [...panel.querySelectorAll("button:not([hidden])")].filter(b => b.offsetParent !== null); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    });
    return panel;
  }
  let opener = null;                                                               // the control that opened the panel gets focus back
  function close() { panel.classList.remove("is-open"); panel.setAttribute("aria-hidden", "true"); if (opener && opener.isConnected) opener.focus({ preventScroll: true }); opener = null; if (window.lenis && !document.querySelector(".overlay.is-open")) window.lenis.start(); }
  // the panel opens straight away with a LOADING TAPE readout while the photos and fonts arrive, then the sticker lands
  function openLoading() {
    const p = ensurePanel(); opener = document.activeElement;
    const holder = p.querySelector(".label-img"); holder.innerHTML = '<p class="osd-loading" aria-hidden="true"><span class="rec"></span>LOADING TAPE</p>';
    p.querySelectorAll(".label-actions button").forEach(b => { b.disabled = true; });
    p.querySelector(".label-note").textContent = "";
    p.classList.add("is-open"); p.setAttribute("aria-hidden", "false");
    if (window.lenis) window.lenis.stop();
    if (window.Sound) window.Sound.play("click");
    p.querySelector(".label-close").focus();
  }
  async function open(canvas, name) {
    const p = ensurePanel();
    p.querySelectorAll(".label-actions button").forEach(b => { b.disabled = false; });
    currentName = name; currentBlob = await new Promise(res => canvas.toBlob(res, "image/png"));
    const holder = p.querySelector(".label-img"); holder.innerHTML = ""; canvas.className = "label-canvas"; holder.appendChild(canvas);
    const share = p.querySelector('[data-act="share"]'); share.hidden = !(navigator.canShare && navigator.canShare({ files: [new File([currentBlob], name, { type: "image/png" })] }));
    p.querySelector(".label-note").textContent = "";
    if (!p.classList.contains("is-open")) { opener = document.activeElement; p.classList.add("is-open"); p.setAttribute("aria-hidden", "false"); if (window.lenis) window.lenis.stop(); p.querySelector(".label-close").focus(); }
  }
  window.Label = {
    async night(f, watchedAt) { openLoading(); open(await renderNight(f, watchedAt), `31for31-night-${String(f.day).padStart(2, "0")}.png`); },
    async list(films, state) { openLoading(); open(await renderList(films, state), "31for31-my-tape-log.png"); },
    close,
    render: { night: renderNight, list: renderList, site: renderSite },   // raw canvases, for the OG card build and tests
  };
})();
