/* The Shelf — the Gallery view as a video store wall. Thirty one sleeves (cardboard cases with the poster on the
   front and a spine label) stand face out on two shelves, each with a cassette (Meshy retro VHS, decimated) inside.
   Drag or scroll to pan along the wall, hover to make the tape poke out of its sleeve, click to pull it and go to
   that night. Shares the site's 3D look via vhs3d.js, with the grain turned right down so it does not sit on top of everything. */
import * as THREE from "three";
import * as VHS from "./vhs3d.js?v=20261026a";

const canvas = document.getElementById("shelf");
const LOOK = { grain: 0, scan: 0, lift: 0 };               // none of the noise or the shadow lift the dark hero scenes use: the overlay's black shows through
const TOUCH = matchMedia("(pointer: coarse), (hover: none)").matches;   // phones and tablets: no hover, so the hint speaks touch
const HINT = TOUCH ? "Swipe to browse · tap a tape to open" : "Drag or use the arrow keys · click or press Enter to pull";
/* Phones and tablets get a carousel instead of the wall: one case at a time, big, turning slowly, with the night and
   title under it. Swipe for the next night, tap the case to open it. Decided once, when the module loads. */
const CAROUSEL = TOUCH || matchMedia("(max-width: 720px)").matches;
const STEP = 2.2;                                                   // world units between cases in the carousel
if (canvas) init();

function init() {
  const overlay = canvas.closest(".overlay");
  const FILMS = window.FILMS;
  const renderer = VHS.renderer(canvas);
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.02);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  VHS.environment(renderer, scene);
  const rig = VHS.lights(scene, 6); scene.remove(rig.warm, rig.rim, rig.under);   // no orange pointer light and no green rim or underlight: they tint the tapes
  // store lighting: a broad cool wash from the front plus a soft sky/ground fill so every sleeve reads
  const front = new THREE.DirectionalLight(0xe6f0ff, 1.1); front.position.set(2, 4, 10); scene.add(front);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0d1510, 0.3));   // the sleeves light themselves; the wall stays black

  /* ---- layout ---- */
  const ROWS = [16, 15], GAP = 1.6, ROW_Y = [1.05, -1.05], SHELF_Z = 0;   // GAP leaves about a third of a sleeve between cases
  const tapes = [];                       // { group, film, home, index }
  const glow = { value: 0 };                                // no fresnel rim on the shelf, it mottles the tapes
  let ready = false, tapeSize = new THREE.Vector3(1, 1.9, 0.3);
  const wallWidth = (ROWS[0] - 1) * GAP;

  // shelves: two dark boards the tapes sit on
  const board = new THREE.Mesh(new THREE.BoxGeometry(wallWidth + 18, 0.12, 1.4), VHS.treat(new THREE.MeshStandardMaterial({ color: 0x0e1013, roughness: 0.9 }), { glow: { value: 0.05 }, cacheKey: "vhs-board", ...LOOK }));
  if (!CAROUSEL) ROW_Y.forEach(y => { const b = board.clone(); b.position.set(0, y - 1.02, SHELF_Z - 0.3); scene.add(b); });
  // no back wall: the canvas is transparent and the overlay's black shows through, so the whole view is one black

  const loader = VHS.gltfLoader(), texLoader = new THREE.TextureLoader();
  const spineLabel = f => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 96; const x = c.getContext("2d");
    x.fillStyle = "#e8e4d8"; x.fillRect(0, 0, 512, 96);
    x.fillStyle = "#4dff8c"; x.fillRect(0, 0, 10, 96);
    x.fillStyle = "#07090c"; x.font = "bold 44px 'Saans Mono', 'Courier New', monospace"; x.textBaseline = "middle";
    x.fillText(String(f.day).padStart(2, "0"), 26, 48);
    x.font = "34px 'Saans Mono', 'Courier New', monospace"; x.fillText(f.title.toUpperCase().slice(0, 22), 100, 48);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };

  /* The cassette is Meredith's modelled VHS (assets/models/vhs-tape-model.glb, from VHSTape.obj with its own colour and
     normal maps from textures.zip). ?tape=grimy swaps in the Meshy "grimy forgotten VHS" scan (vhs-tape-grimy.glb: vertices welded, then
     decimated to 47k triangles, 1k textures, no normal map). A drawn fallback (plain box with a sticker label) stays
     behind ?tape=drawn. */
  const TAPE_KIND = { grimy: "grimy", drawn: "drawn" }[new URLSearchParams(location.search).get("tape")] || "model";
  const buildTapes = (scan) => {
    let geo;
    if (scan && TAPE_KIND === "model") {
      // the OBJ comes in lying flat, face up and thinner than a real cassette: stand it on end, face forward, and
      // deepen the shell to real proportions (187 x 103 x 25 mm)
      let src; scan.scene.traverse(o => { if (o.isMesh && !src) src = o; });
      src.updateWorldMatrix(true, false);
      geo = src.geometry.clone().applyMatrix4(src.matrixWorld);
      geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 2);
      geo.computeBoundingBox();
      let size = geo.boundingBox.getSize(new THREE.Vector3()), center = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-center.x, -center.y, -center.z);
      const k = 1.9 / size.y; geo.scale(k, k, k * (25 / 187) * 1.9 / (size.z * k)); geo.computeBoundingBox();
      tapeSize.copy(geo.boundingBox.getSize(new THREE.Vector3()));
      // the model ships with its own colour and normal maps; keep them, just tame the shine and add a little self light
      const m = src.material; m.metalness = 0; m.metalnessMap = null; m.roughness = Math.max(m.roughness ?? 0.5, 0.5);
      VHS.treat(m, { glow, cacheKey: "vhs-tape-model", ...LOOK });
      m.envMapIntensity = 0.5; m.emissiveMap = m.map; m.emissive.set(0xffffff); m.emissiveIntensity = 0.18;
      buildTapes.scanMat = m;
    } else if (scan) {
      let src; scan.scene.traverse(o => { if (o.isMesh && !src) src = o; });
      src.updateWorldMatrix(true, false);
      geo = src.geometry.clone().applyMatrix4(src.matrixWorld); geo.computeBoundingBox();
      let size = geo.boundingBox.getSize(new THREE.Vector3()), center = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-center.x, -center.y, -center.z);
      if (size.x > size.y) { geo.rotateZ(Math.PI / 2); geo.computeBoundingBox(); size = geo.boundingBox.getSize(new THREE.Vector3()); }
      const k = 1.9 / size.y; geo.scale(k, k, k); tapeSize.copy(size).multiplyScalar(k);
      const m = src.material; m.side = THREE.DoubleSide; m.metalness = 0; m.metalnessMap = null; m.roughness = 0.85; m.roughnessMap = null; m.normalMap = null;
      VHS.treat(m, { glow, cacheKey: "vhs-tape-scan", ...LOOK }); m.emissiveMap = m.map; m.emissive.set(0xffffff); m.emissiveIntensity = 0.5; m.color.setRGB(1.8, 1.8, 1.8);
      buildTapes.scanMat = m;
    } else {
      tapeSize.set(1.9 * 103 / 187, 1.9, 1.9 * 25 / 187);
      geo = new THREE.BoxGeometry(tapeSize.x, tapeSize.y, tapeSize.z);
    }
    const plastic = VHS.treat(new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.82 }), { glow, cacheKey: "vhs-tape-shell", ...LOOK });
    plastic.envMapIntensity = 0.2;
    const faceFor = f => {
      // drawn lying flat (long side across) at the tape's real proportions, then turned 90 degrees onto the standing face.
      // Plain black plastic with the sticker label: night, title, format line. No drawn mechanics.
      const W = 854, H = 512;
      const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
      x.fillStyle = "#0e0f12"; x.fillRect(0, 0, W, H);
      // grip ridges moulded into both ends
      x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 2;
      for (let i = 0; i < 9; i++) { [40 + i * 7, W - 40 - i * 7].forEach(xx => { x.beginPath(); x.moveTo(xx, 40); x.lineTo(xx, H - 40); x.stroke(); }); }
      // the sticker label
      const L = { x: 110, y: 96, w: W - 220, h: H - 192 };
      x.fillStyle = "#ece8dc"; x.fillRect(L.x, L.y, L.w, L.h);
      ["#ff2d55", "#ff6a1a", "#4dff8c", "#2ee6ff"].forEach((col, i) => { x.fillStyle = col; x.fillRect(L.x, L.y + i * 9, L.w, 9); });
      x.fillStyle = "#101216"; x.textBaseline = "middle"; x.textAlign = "left";
      x.font = "700 30px 'Saans Mono', 'Courier New', monospace"; x.fillText("31 FOR 31   ·   NIGHT " + String(f.day).padStart(2, "0"), L.x + 28, L.y + 84);
      x.font = "700 64px 'Saans Mono', 'Courier New', monospace";
      let title = f.title.toUpperCase(); while (x.measureText(title).width > L.w - 56 && title.length > 4) title = title.slice(0, -2) + "…";
      x.fillText(title, L.x + 28, L.y + 168);
      x.font = "400 24px 'Saans Mono', 'Courier New', monospace"; x.fillStyle = "#4b4f57";
      x.fillText("T-120   SP   " + f.year, L.x + 28, L.y + L.h - 44);
      x.textAlign = "right"; x.fillText("VHS", L.x + L.w - 28, L.y + L.h - 44);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      t.center.set(0.5, 0.5); t.rotation = Math.PI / 2;
      return t;
    };
    const tapeMatFor = f => {
      if (buildTapes.scanMat) return buildTapes.scanMat;
      const face = VHS.treat(new THREE.MeshStandardMaterial({ map: faceFor(f), roughness: 0.8 }), { glow, cacheKey: "vhs-tape-face", ...LOOK });
      face.emissiveMap = face.map; face.emissive.set(0xffffff); face.emissiveIntensity = 0.12;           // the label reads even deep in the case
      return [plastic, plastic, plastic, plastic, face, plastic];                                           // +x, -x, +y, -y, front, back
    };

    /* the sleeve: a cardboard case a hair bigger than the tape, open on the left side (the tape slides out sideways),
       poster on the front and label on the right hand spine */
    const SLEEVE = new THREE.Vector3(tapeSize.x * 1.04, tapeSize.y * 1.08, tapeSize.z * 1.25);
    const sleeveGeo = new THREE.BoxGeometry(SLEEVE.x, SLEEVE.y, SLEEVE.z);          // fallback if the box models fail to load
    /* the modelled sleeves: four low poly VHS boxes (Adachi, Mamphis, Maxell, Philips), each exported with three
       material slots named front, spine and body and planar UVs, so the poster and the label drop straight on */
    const boxKits = [];
    if (boxGltf) boxGltf.scene.children.forEach(node => {
      const meshes = []; node.traverse(o => { if (o.isMesh) meshes.push(o); });
      if (!meshes.length) return;
      const bb = new THREE.Box3().setFromObject(node), size = bb.getSize(new THREE.Vector3());
      boxKits.push({ node, size });
    });
    const makeSleeve = (f, i, posterMat, spineMat) => {
      if (!boxKits.length) return new THREE.Mesh(sleeveGeo, [spineMat, mouth, card, inside, posterMat, card]);
      const kit = boxKits[i % boxKits.length];
      const box = kit.node.clone();
      box.traverse(o => { if (o.isMesh) { const n = o.material.name; o.material = n === "front" ? posterMat : n === "spine" ? spineMat : card; } });
      box.scale.set(SLEEVE.x / kit.size.x, SLEEVE.y / kit.size.y, SLEEVE.z / kit.size.z);
      return box;
    };
    const card = VHS.treat(new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.92, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-card", ...LOOK });
    const inside = new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 1, side: THREE.DoubleSide });
    const mouth = new THREE.MeshBasicMaterial({ visible: false });                  // open left side
    // the tape hangs off a pivot at the mouth of the case (its left edge); at rest it sits just inside
    const tapeRestX = tapeSize.x / 2 + 0.005;                       // flush with the mouth of the case

    let i = 0;
    ROWS.forEach((count, r) => {
      const x0 = -((count - 1) * GAP) / 2;
      for (let c = 0; c < count && i < FILMS.length; c++, i++) {
        const f = FILMS[i];
        const g = new THREE.Group();
        const hinge = new THREE.Group(); hinge.position.x = -SLEEVE.x / 2; g.add(hinge);
        const tape = new THREE.Mesh(geo, tapeMatFor(f)); tape.position.x = tapeRestX; hinge.add(tape);
        const posterTex = texLoader.load(f.poster); posterTex.colorSpace = THREE.SRGBColorSpace;
        const posterMat = VHS.treat(new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.75, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-poster", ...LOOK });
        posterMat.emissiveMap = posterTex; posterMat.emissive.set(0xffffff); posterMat.emissiveIntensity = 0.45;   // sleeves are lit from within, like a backlit wall
        const spineMat = VHS.treat(new THREE.MeshStandardMaterial({ map: spineLabel(f), roughness: 0.85, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-spine", ...LOOK });
        if (!boxKits.length) { spineMat.map.center.set(0.5, 0.5); spineMat.map.rotation = Math.PI / 2; }   // the fallback box needs the label turned; the models carry their own UVs
        // BoxGeometry face order: +x, -x, +y, -y, +z, -z
        const sleeve = makeSleeve(f, i, posterMat, spineMat); g.add(sleeve); g.userData.posterMat = posterMat;
        if (CAROUSEL) {
          g.position.set(i * STEP, 0, SHELF_Z);                                  // one case per stop, in a line
        } else {
          // a little lean and jitter so the shelf looks lived in
          g.rotation.y = (Math.random() - 0.5) * 0.12; g.rotation.z = (Math.random() - 0.5) * 0.02;
          g.position.set(x0 + c * GAP, ROW_Y[r], SHELF_Z + (Math.random() - 0.5) * 0.06);
        }
        g.userData.home = g.position.clone(); g.userData.homeRot = g.rotation.clone(); g.userData.film = f; g.userData.index = i; g.userData.tape = tape; g.userData.hinge = hinge; g.userData.sleeve = sleeve; g.userData.restX = tapeRestX;
        scene.add(g); tapes.push(g);
      }
    });
    // keyboard focus frame: a green plate behind the focused case
    focusRing = new THREE.Mesh(new THREE.PlaneGeometry(SLEEVE.x * 1.16, SLEEVE.y * 1.08), new THREE.MeshBasicMaterial({ color: 0x4dff8c, transparent: true, opacity: 0.55, depthWrite: false }));
    focusRing.visible = false; scene.add(focusRing);
    ready = true;
    paintWatched();
    if (CAROUSEL) setIndex(cur, true);
    window.__shelf.ready = true;
    const loading = overlay.querySelector(".shelf-loading"); if (loading) { loading.classList.add("is-done"); setTimeout(() => loading.remove(), 400); }
  };
  // the labels are drawn with the site's mono face, so wait for it (falls back to Courier if it never arrives)
  let boxGltf = null;
  const boxes = new Promise(res => loader.load("assets/models/vhs-boxes.glb", g => res(g), undefined, err => { console.error("box models failed, using plain sleeves", err); res(null); }));
  const fonts = document.fonts ? document.fonts.load("400 54px 'Saans Mono'").catch(() => {}) : Promise.resolve();
  const tapeFile = { model: "assets/models/vhs-tape-model.glb", grimy: "assets/models/vhs-tape-grimy.glb" }[TAPE_KIND];
  const tapeScan = tapeFile ? new Promise(res => loader.load(tapeFile, g => res(g), undefined, err => { console.error("tape model failed", err); res(null); })) : Promise.resolve(null);
  Promise.all([boxes, fonts, tapeScan]).then(([b, , t]) => { boxGltf = b; buildTapes(t); });

  // the stacked tapes as bookends on the lower shelf
  if (!CAROUSEL) loader.load("assets/models/tape-stack.glb", gltf => {
    const root = gltf.scene; root.traverse(o => { if (o.isMesh) VHS.treat(o.material, { glow: { value: 0.08 }, cacheKey: "vhs-stack", ...LOOK }); });
    const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    root.position.sub(center); const s = 1.85 / size.y;                                 // fills the gap between the boards without touching the one above
    const boardTop = ROW_Y[1] - 1.02 + 0.06;
    [-1, 1].forEach(side => {
      const h = new THREE.Group(); h.add(root.clone()); h.scale.setScalar(s);
      h.position.set(side * (wallWidth / 2 + 2.0), boardTop + 0.925, SHELF_Z - 0.2); h.rotation.y = side * 0.35;
      scene.add(h);
    });
  });

  /* ---- watched stamps on the spines ---- */
  function paintWatched() {
    const WL = window.Watchlist; if (!WL || !ready) return;
    tapes.forEach(g => { const on = WL.isWatched(g.userData.film.slug); const m = g.userData.posterMat; m.emissiveIntensity = on ? 0.6 : 0.45; m.color.set(on ? 0xbfffd6 : 0xffffff); });
  }
  window.Watchlist && window.Watchlist.onChange(paintWatched);

  /* ---- camera, panning, picking ---- */
  const maxPan = () => wallWidth / 2 - 1.5;
  const panMin = () => CAROUSEL ? 0 : -maxPan(), panMax = () => CAROUSEL ? (FILMS.length - 1) * STEP : maxPan();
  // the carousel opens on tonight's film while October is on, otherwise night 1
  const openingIndex = () => { const d = new Date(); return d.getMonth() === 9 ? Math.min(FILMS.length, d.getDate()) - 1 : 0; };
  let cur = CAROUSEL ? openingIndex() : 0, dragT0 = 0;
  let open = false, panX = CAROUSEL ? cur * STEP : -maxPan(), panTarget = panX, dragging = false, dragStart = 0, panStart = 0, moved = 0;   // the wall starts at night 1, far left
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(-9, -9);
  let hovered = null, kbFocus = null, focusRing = null;
  const live = overlay.querySelector("#shelf-live");
  const announce = g => { if (live) live.textContent = g ? `Night ${g.userData.film.day}, ${g.userData.film.title}. Press Enter to open.` : ""; };
  function focusTape(g) {
    kbFocus = g; ndc.set(-9, -9);                             // the keyboard takes over from wherever the pointer was
    if (g) { panTarget = THREE.MathUtils.clamp(g.userData.home.x, panMin(), panMax()); announce(g); }
    if (focusRing) focusRing.visible = !!g;
  }
  canvas.addEventListener("keydown", e => {
    if (!ready) return;
    const i = kbFocus ? kbFocus.userData.index : -1, n = tapes.length, row0 = ROWS[0];
    let next = null;
    if (CAROUSEL) {                                                                // one night per key press, Enter opens it
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setIndex(cur + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setIndex(cur - 1);
      else if (e.key === "Home") setIndex(0);
      else if (e.key === "End") setIndex(n - 1);
      else if (e.key === "Enter" || e.key === " ") pullAndGo(tapes[cur]);
      else return;
      e.preventDefault(); return;
    }
    if (e.key === "ArrowRight") next = i < 0 ? nearest() : Math.min(n - 1, i + 1);
    else if (e.key === "ArrowLeft") next = i < 0 ? nearest() : Math.max(0, i - 1);
    else if (e.key === "ArrowDown") next = i < 0 ? nearest() : Math.min(n - 1, i + row0);
    else if (e.key === "ArrowUp") next = i < 0 ? nearest() : Math.max(0, i - row0);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if ((e.key === "Enter" || e.key === " ") && kbFocus) { e.preventDefault(); pullAndGo(kbFocus); return; }
    else return;
    e.preventDefault(); focusTape(tapes[next]);
  });
  // from the opening position start at night 1, otherwise the case nearest the centre of the view (top row first)
  const nearest = () => { if (panTarget <= panMin() + 1e-6) return 0; let best = 0, d = Infinity; tapes.forEach((g, k) => { const dd = Math.abs(g.userData.home.x - panX) + (g.userData.home.y < 0 ? 3 : 0); if (dd < d) { d = dd; best = k; } }); return best; };
  canvas.addEventListener("pointerdown", () => { if (kbFocus) focusTape(null); });

  const hint = overlay.querySelector(".shelf-hint"); if (hint) hint.textContent = HINT;
  /* the carousel's caption: night, title and count, in HTML under the case so the type stays crisp */
  let cap = null;
  if (CAROUSEL) {
    cap = document.createElement("div"); cap.className = "shelf-cap"; cap.setAttribute("aria-hidden", "true");
    cap.innerHTML = '<p class="n"></p><p class="t"></p><p class="c"></p>';
    overlay.appendChild(cap);
  }
  function setIndex(i, instant) {
    if (!CAROUSEL) return;
    const n = tapes.length || FILMS.length;
    i = THREE.MathUtils.clamp(i, 0, n - 1);
    const changed = i !== cur; cur = i; panTarget = cur * STEP;
    if (instant) panX = panTarget;
    const f = FILMS[cur];
    if (cap) {
      const WL = window.Watchlist, watched = WL && WL.isWatched(f.slug);
      cap.querySelector(".n").textContent = `Night ${String(f.day).padStart(2, "0")} of 31`;
      cap.querySelector(".t").textContent = f.title;
      cap.querySelector(".c").textContent = watched ? "Watched" : "";                       // the night line above already counts; this only flags a ticked tape
      if (changed && !instant) gsap.fromTo(cap.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, stagger: .05, ease: "power2.out", clearProps: "all" });
    }
    if (ready && !leaving) {
      // the current case's tape sits an inch out of its mouth, the others stay home
      tapes.forEach((g, k) => { gsap.killTweensOf(g.userData.tape.position); gsap.to(g.userData.tape.position, { x: g.userData.restX - (k === cur ? tapeSize.x * 0.16 : 0), duration: instant ? 0 : .5, ease: "power2.out" }); });
      if (live && !instant) live.textContent = `Night ${f.day}, ${f.title}. Tap or press Enter to open.`;
    }
  }
  const toNdc = e => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)); };
  // the night under a screen point, or null: the frame loop uses the same cast for hover, a tap uses it directly
  const pick = () => {
    if (!ready) return null;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(tapes, true)[0];
    let g = hit ? hit.object : null; while (g && !g.userData.film) g = g.parent;
    return g;
  };
  canvas.addEventListener("pointermove", e => {
    toNdc(e);
    if (dragging) {
      const dx = e.clientX - dragStart;
      panTarget = CAROUSEL ? panStart - dx * (STEP / cw) * 1.1 : panStart - dx * 0.012;   // the carousel: one screen width is about one night
      moved = Math.max(moved, Math.abs(dx));
    }
  });
  // a finger has no hover: pointerdown is the first thing it sends, so the point is read here as well
  canvas.addEventListener("pointerdown", e => { toNdc(e); dragging = true; dragStart = e.clientX; dragT0 = performance.now(); panStart = CAROUSEL ? panX : panTarget; moved = 0; try { canvas.setPointerCapture(e.pointerId); } catch {} });
  const endDrag = e => {
    if (!dragging) return; dragging = false;
    if (e.type === "pointercancel") { if (CAROUSEL) setIndex(cur); return; }
    if (moved < 8) {                                                                  // a tap: cast at the lift point rather than trusting the last hover
      toNdc(e); const g = pick() || hovered || (CAROUSEL && Math.abs(ndc.x) < 0.6 ? tapes[cur] : null);   // a tap near the middle counts as a tap on the case
      if (g) pullAndGo(g);
      else if (CAROUSEL) setIndex(cur);                                                // a tap on nothing just settles the carousel
    } else if (CAROUSEL) {
      // a swipe: a quick flick moves one night in its direction, a slow drag settles on the nearest stop
      const dx = e.clientX - dragStart, quick = performance.now() - dragT0 < 350 && Math.abs(dx) > 30;
      setIndex(quick ? cur - Math.sign(dx) : Math.round(panTarget / STEP));
    }
    if (e.pointerType === "touch") ndc.set(-9, -9);                                  // nothing stays "hovered" under a lifted finger
  };
  canvas.addEventListener("pointerup", endDrag); canvas.addEventListener("pointercancel", endDrag);
  let wheelAt = 0;
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (CAROUSEL) { if (Math.abs(d) > 12 && performance.now() - wheelAt > 450) { wheelAt = performance.now(); setIndex(cur + Math.sign(d)); } }
    else panTarget += d * 0.01;
  }, { passive: false });
  canvas.addEventListener("pointerleave", () => { ndc.set(-9, -9); });

  let leaving = false;                                                               // a night is on its way out: the carousel leaves its tape alone
  function pullAndGo(g) {
    if (leaving) return; leaving = true;
    const f = g.userData.film;
    if (window.Sound) window.Sound.play("insert");
    // replaceState rather than location.hash: a hash change makes the browser scroll the night's overflow-hidden sideways week along with it
    gsap.timeline({ onComplete: () => { leaving = false; history.replaceState(null, "", `#day-${String(f.day).padStart(2, "0")}`); dispatchEvent(new CustomEvent("shelf:pick", { detail: f })); } })
      .to(g.position, { z: g.userData.home.z + 1.1, duration: .35, ease: "power2.out" })
      .to(g.rotation, { y: 0, x: -0.12, duration: .35, ease: "power2.out" }, 0)
      .to(g.userData.tape.position, { x: g.userData.restX - tapeSize.x * 1.05, duration: .4, ease: "power2.in" }, .15)
      .to(g.userData.hinge.rotation, { y: 1.0, duration: .4, ease: "power2.in" }, .2);
  }

  let cw = 1, ch = 1;
  function resize() {
    const r = canvas.getBoundingClientRect(); cw = r.width; ch = r.height;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }

  /* The headline. On wide screens the opening view has empty wall left of night 1 (the camera starts 1.5 units in from the
     end of the wall and sees further the wider the screen), so the mark sits there, level with the top row, over the left
     bookend, and moves with the wall as the shelf pans. Narrower screens keep it centred under the deck. */
  const TITLE_ANCHOR = new THREE.Vector3(-(wallWidth / 2 + 2.0), ROW_Y[0], SHELF_Z);
  const FIRST_CASE_LEFT = -wallWidth / 2 - 0.6;
  const h2 = overlay.querySelector("h2");
  let sideTitle = false;
  function placeTitle(dist) {
    if (!h2) return;
    const halfW = dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;   // world units visible either side of centre
    const pxPerUnit = cw / (2 * halfW);
    const gap = (FIRST_CASE_LEFT + maxPan() + halfW) * pxPerUnit;                              // px between the screen edge and night 1 at the opening position
    const side = gap >= 270;                                                                   // room for a 220px mark with air either side
    if (side !== sideTitle) { sideTitle = side; overlay.classList.toggle("is-side-title", side); }
    if (!side) return;
    camera.updateMatrixWorld();
    const a = TITLE_ANCHOR.clone().project(camera);
    overlay.style.setProperty("--title-x", `${((a.x + 1) / 2 * cw).toFixed(1)}px`);
    overlay.style.setProperty("--title-y", `${((1 - a.y) / 2 * ch).toFixed(1)}px`);
    overlay.style.setProperty("--title-w", `${Math.min(gap - 48, 340).toFixed(0)}px`);
  }
  addEventListener("resize", resize);

  let raf = null;
  function frame(now) {
    if (!open) { raf = null; return; }
    window.__shelf.frames = (window.__shelf.frames || 0) + 1;
    const t = now / 1000;
    panTarget = THREE.MathUtils.clamp(panTarget, panMin() - (CAROUSEL ? 0.6 : 0), panMax() + (CAROUSEL ? 0.6 : 0));   // a little give past the ends of the carousel
    panX += (panTarget - panX) * (CAROUSEL ? 0.12 : 0.08);
    let dist;
    if (CAROUSEL) {
      // the case stands about 46% of the screen's height, a little above centre, so it clears the mark at the top
      // and the caption and nav pill at the bottom; on a phone that is about half the width
      dist = window.__shelf.debugDist || 7.3;
      camera.position.set(panX, -0.3, dist); camera.lookAt(panX, -0.3, 0);
      tapes.forEach((g, k) => {
        const want = k === cur ? Math.sin(t * 0.45) * 0.26 : 0;                    // the current case turns slowly, about 15 degrees either way
        g.rotation.y += (want - g.rotation.y) * 0.08;
      });
    } else {
      dist = window.__shelf.debugDist || (camera.aspect > 1.2 ? 11.2 : 14.5);   // debugDist: zoom in from the console for checks
      const camY = camera.aspect > 1.2 ? 0.47 : 0.7;                           // narrow screens: rows sit a little lower, under the hint
      camera.position.set(panX, camY + Math.sin(t * 0.5) * 0.03, dist);   // level camera, just above centre: headline clears the top row, lower board stays in frame
      camera.lookAt(panX, camY, 0);
      placeTitle(dist);
    }
    VHS.tick(t);
    if (ready) {
      let g = pick();                                                                // the night under the pointer, climbing from any child mesh to the group
      if (!g && kbFocus) g = kbFocus;                                               // keyboard focus shows like a hover until the pointer finds a tape
      if (window.__shelf.lock) g = window.__shelf.lock;                              // debug: hold a night pulled regardless of the pointer
      if (focusRing && kbFocus) { focusRing.position.set(kbFocus.userData.home.x, kbFocus.userData.home.y, kbFocus.userData.home.z - 0.3); focusRing.visible = true; }
      if (g !== hovered) {
        if (hovered) { gsap.killTweensOf([hovered.userData.tape.position, hovered.userData.hinge.rotation]); gsap.to(hovered.userData.hinge.rotation, { y: 0, duration: .3, ease: "power2.out" }); gsap.to(hovered.userData.tape.position, { x: hovered.userData.restX - (CAROUSEL && hovered.userData.index === cur ? tapeSize.x * 0.16 : 0), duration: .4, ease: "power2.out", delay: .08 }); }
        hovered = g;
        if (g) {
          // slides most of the way out of the open side, then swings forward on the mouth of the case like a door,
          // so the free end sits in front of the case to the left while the inner end stays in its own sleeve
          gsap.killTweensOf([g.userData.tape.position, g.userData.hinge.rotation]);
          if (window.Sound) window.Sound.play("pull");
          gsap.timeline()
            .to(g.userData.tape.position, { x: g.userData.restX - tapeSize.x * 0.82, duration: .4, ease: "power3.out" })
            .to(g.userData.hinge.rotation, { y: 0.75, duration: .4, ease: "power3.out" }, .12);
        }
        const curEl = document.getElementById("cursor"); if (curEl) curEl.classList.toggle("is-play", !!g);
        if (hint) hint.textContent = g ? `${String(g.userData.film.day).padStart(2, "0")} · ${g.userData.film.title}` : HINT;
      }
      glow.value = 0.1 + 0.05 * Math.sin(t * 2);
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  window.__shelf = {
    ready: false,
    carousel: CAROUSEL,
    index: () => cur,
    pan: () => ({ panX: +panX.toFixed(3), panTarget: +panTarget.toFixed(3), dragging, leaving, open, raf: !!raf, cw }),   // debug
    go: i => setIndex(i),
    open() {
      open = true; resize();
      tapes.forEach(g => { gsap.killTweensOf([g.position, g.rotation, g.userData.tape.position, g.userData.hinge.rotation]); g.position.copy(g.userData.home); g.rotation.copy(g.userData.homeRot); g.userData.tape.position.x = g.userData.restX; g.userData.hinge.rotation.y = 0; });   // a picked case comes back to rest
      if (CAROUSEL && ready) setIndex(cur, true); if (!raf) raf = requestAnimationFrame(frame); requestAnimationFrame(() => canvas.focus({ preventScroll: true })); },
    close() { open = false; focusTape(null); if (hovered) { gsap.to(hovered.userData.hinge.rotation, { y: 0, duration: .3 }); gsap.to(hovered.userData.tape.position, { x: hovered.userData.restX, duration: .3 }); hovered = null; } if (CAROUSEL) setIndex(cur); const curEl = document.getElementById("cursor"); if (curEl) curEl.classList.remove("is-play"); },
    focusDay(day) { const g = tapes.find(tp => tp.userData.film.day === day); if (g) focusTape(g); },
    probe(nx, ny) { raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera); const h = raycaster.intersectObjects(tapes, true)[0]; let g = h && h.object; while (g && !g.userData.film) g = g.parent; return g ? { film: g.userData.film.title, obj: h.object.name || h.object.type, mat: h.object.material && (h.object.material.name || (Array.isArray(h.object.material) ? "array" : "unnamed")), isTape: h.object === g.userData.tape, dist: h.distance } : null; },
    hovered: () => hovered && hovered.userData.film.title,
    pull(day) { window.__shelf.lock = tapes.find(tp => tp.userData.film.day === day) || null; },   // debug: hold that night's tape out
    release() { window.__shelf.lock = null; },
    describe(day) {                                          // debug: world boxes of a night's case and tape
      const g = tapes.find(tp => tp.userData.film.day === day); if (!g) return null;
      const bb = o => { const b = new THREE.Box3().setFromObject(o); return { min: b.min.toArray().map(v => +v.toFixed(3)), max: b.max.toArray().map(v => +v.toFixed(3)) }; };
      const sleeveMeshes = []; g.userData.sleeve.traverse(o => { if (o.isMesh) sleeveMeshes.push({ name: o.name, mat: o.material.name || "(assigned)", tris: o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3 }); });
      return { film: g.userData.film.title, hinge: +g.userData.hinge.rotation.y.toFixed(3), tapeX: +g.userData.tape.position.x.toFixed(3), restX: +g.userData.restX.toFixed(3), sleeve: bb(g.userData.sleeve), tape: bb(g.userData.tape), sleeveMeshes, hovered: hovered === g };
    },
  };
}
