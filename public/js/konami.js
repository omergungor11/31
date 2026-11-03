/* The Konami code. A tracking glitch, then a bonus tape (window.BONUS, not one of the 31) turns slowly in the dark under
   the message: a sleeve with the poster on the front and a spine label, the modelled cassette inside, built the way the
   Shelf builds its cases. Loaded by main.js the first time the code is typed; click or Escape puts it away. */
import * as THREE from "three";
import * as VHS from "./vhs3d.js?v=20261026a";

const box = document.getElementById("konami");
if (box) init();

function init() {
  const canvas = box.querySelector(".konami-hand");
  const FILM = window.BONUS;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOOK = { grain: 0, scan: 0, lift: 0 };                     // the overlay's own black shows through, as on the Shelf
  const renderer = VHS.renderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6); camera.lookAt(0, 0, 0);
  VHS.environment(renderer, scene);
  const { warm } = VHS.lights(scene, 4);
  const glow = { value: 0.22 };
  const rig = new THREE.Group(); scene.add(rig);
  let ready = false;

  // the film line under the copy, from the data
  const line = box.querySelector(".konami-film");
  if (line && FILM) {
    const q = encodeURIComponent(`${FILM.title} ${FILM.year}`);
    line.innerHTML = `<b></b><span></span><a href="https://www.justwatch.com/us/search?q=${q}" target="_blank" rel="noopener" title="Opens a JustWatch search for this film">Where to watch ↗</a>`;
    line.querySelector("b").textContent = FILM.title;
    line.querySelector("span").textContent = `${FILM.year} · Dir. ${FILM.director}`;
  }

  /* ---- the case, assembled like a Shelf sleeve ---- */
  const loader = VHS.gltfLoader(), texLoader = new THREE.TextureLoader();
  const mono = "'Saans Mono', 'Courier New', monospace";
  const spineLabel = () => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 96; const x = c.getContext("2d");
    x.fillStyle = "#e8e4d8"; x.fillRect(0, 0, 512, 96);
    x.fillStyle = "#4dff8c"; x.fillRect(0, 0, 10, 96);
    x.fillStyle = "#07090c"; x.textBaseline = "middle";
    x.font = `bold 44px ${mono}`; x.fillText("+1", 26, 48);
    x.font = `34px ${mono}`; x.fillText(FILM.title.toUpperCase().slice(0, 22), 100, 48);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const faceLabel = () => {
    const W = 854, H = 512, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    x.fillStyle = "#0e0f12"; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 2;
    for (let i = 0; i < 9; i++) { [40 + i * 7, W - 40 - i * 7].forEach(xx => { x.beginPath(); x.moveTo(xx, 40); x.lineTo(xx, H - 40); x.stroke(); }); }
    const L = { x: 110, y: 96, w: W - 220, h: H - 192 };
    x.fillStyle = "#ece8dc"; x.fillRect(L.x, L.y, L.w, L.h);
    ["#ff2d55", "#ff6a1a", "#4dff8c", "#2ee6ff"].forEach((col, i) => { x.fillStyle = col; x.fillRect(L.x, L.y + i * 9, L.w, 9); });
    x.fillStyle = "#101216"; x.textBaseline = "middle"; x.textAlign = "left";
    x.font = `700 30px ${mono}`; x.fillText("31 FOR 31   ·   BONUS TAPE", L.x + 28, L.y + 84);
    x.font = `700 64px ${mono}`;
    let title = FILM.title.toUpperCase(); while (x.measureText(title).width > L.w - 56 && title.length > 4) title = title.slice(0, -2) + "…";
    x.fillText(title, L.x + 28, L.y + 168);
    x.font = `400 24px ${mono}`; x.fillStyle = "#4b4f57";
    x.fillText("T-120   SP   " + FILM.year, L.x + 28, L.y + L.h - 44);
    x.textAlign = "right"; x.fillText("VHS", L.x + L.w - 28, L.y + L.h - 44);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    t.center.set(0.5, 0.5); t.rotation = Math.PI / 2;
    return t;
  };
  const build = (boxGltf, tapeGltf) => {
    const tapeSize = new THREE.Vector3(); let geo, tapeMat;
    if (tapeGltf) {
      let src; tapeGltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
      src.updateWorldMatrix(true, false);
      geo = src.geometry.clone().applyMatrix4(src.matrixWorld);
      geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 2); geo.computeBoundingBox();
      const size = geo.boundingBox.getSize(new THREE.Vector3()), center = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-center.x, -center.y, -center.z);
      const k = 1.9 / size.y; geo.scale(k, k, k * (25 / 187) * 1.9 / (size.z * k)); geo.computeBoundingBox();
      tapeSize.copy(geo.boundingBox.getSize(new THREE.Vector3()));
      const m = src.material; m.metalness = 0; m.metalnessMap = null; m.roughness = Math.max(m.roughness ?? 0.5, 0.5);
      VHS.treat(m, { glow, cacheKey: "vhs-tape-model", ...LOOK });
      m.envMapIntensity = 0.5; m.emissiveMap = m.map; m.emissive.set(0xffffff); m.emissiveIntensity = 0.18;
      tapeMat = m;
    } else {
      tapeSize.set(1.9 * 103 / 187, 1.9, 1.9 * 25 / 187);
      geo = new THREE.BoxGeometry(tapeSize.x, tapeSize.y, tapeSize.z);
      const plastic = VHS.treat(new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.82 }), { glow, cacheKey: "vhs-tape-shell", ...LOOK });
      const face = VHS.treat(new THREE.MeshStandardMaterial({ map: faceLabel(), roughness: 0.8 }), { glow, cacheKey: "vhs-tape-face", ...LOOK });
      face.emissiveMap = face.map; face.emissive.set(0xffffff); face.emissiveIntensity = 0.12;
      tapeMat = [plastic, plastic, plastic, plastic, face, plastic];
    }
    const SLEEVE = new THREE.Vector3(tapeSize.x * 1.04, tapeSize.y * 1.08, tapeSize.z * 1.25);
    const card = VHS.treat(new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.92, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-card", ...LOOK });
    const inside = new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 1, side: THREE.DoubleSide });
    const mouth = new THREE.MeshBasicMaterial({ visible: false });
    const posterTex = texLoader.load(FILM.poster); posterTex.colorSpace = THREE.SRGBColorSpace;
    const posterMat = VHS.treat(new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.75, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-poster", ...LOOK });
    posterMat.emissiveMap = posterTex; posterMat.emissive.set(0xffffff); posterMat.emissiveIntensity = 0.45;
    const spineMat = VHS.treat(new THREE.MeshStandardMaterial({ map: spineLabel(), roughness: 0.85, side: THREE.DoubleSide }), { glow, cacheKey: "vhs-spine", ...LOOK });
    let sleeve = null;
    if (boxGltf) {
      const kits = []; boxGltf.scene.children.forEach(node => { const bb = new THREE.Box3().setFromObject(node), size = bb.getSize(new THREE.Vector3()); if (size.y > 0) kits.push({ node, size }); });
      if (kits.length) {
        const kit = kits[kits.length - 1]; sleeve = kit.node.clone();
        sleeve.traverse(o => { if (o.isMesh) { const n = o.material.name; o.material = n === "front" ? posterMat : n === "spine" ? spineMat : card; } });
        sleeve.scale.set(SLEEVE.x / kit.size.x, SLEEVE.y / kit.size.y, SLEEVE.z / kit.size.z);
      }
    }
    if (!sleeve) { spineMat.map.center.set(0.5, 0.5); spineMat.map.rotation = Math.PI / 2; sleeve = new THREE.Mesh(new THREE.BoxGeometry(SLEEVE.x, SLEEVE.y, SLEEVE.z), [spineMat, mouth, card, inside, posterMat, card]); }
    const g = new THREE.Group();
    const tape = new THREE.Mesh(geo, tapeMat); tape.position.x = -SLEEVE.x / 2 + tapeSize.x / 2 + 0.005; g.add(tape);
    g.add(sleeve); rig.add(g);
    ready = true;
  };
  const boxes = new Promise(res => loader.load("assets/models/vhs-boxes.glb", g => res(g), undefined, err => { console.error("box models failed, plain sleeve", err); res(null); }));
  const tapeScan = new Promise(res => loader.load("assets/models/vhs-tape-model.glb", g => res(g), undefined, err => { console.error("tape model failed", err); res(null); }));
  const fonts = document.fonts ? document.fonts.load("400 54px 'Saans Mono'").catch(() => {}) : Promise.resolve();
  Promise.all([boxes, tapeScan, fonts]).then(([b, t]) => build(b, t));

  let open = false, raf = null;
  function resize() {
    const r = canvas.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    // the copy takes the top of the screen; the case sits in what is left, a little lower on phones where the copy runs longer
    const copy = box.querySelector(".konami-copy"), used = copy ? (copy.getBoundingClientRect().bottom + 24) / r.height : 0.45;
    const visible = 2 * 7.6 * Math.tan(THREE.MathUtils.degToRad(16));                // world units tall at the case
    const top = visible / 2 - used * visible, room = top + visible / 2;              // from under the copy to the bottom edge
    const h = Math.min(2.25, room * 0.74); rig.scale.setScalar(h / 2.05);
    rig.position.y = top - room / 2;
  }
  addEventListener("resize", () => { if (open) resize(); });
  const start = performance.now();
  function frame(now) {
    if (!open) { raf = null; return; }
    const t = REDUCED ? 0 : (now - start) / 1000;
    rig.rotation.y = -0.3 + Math.sin(t * 0.35) * 0.5;                    // the slow turn from the phone Shelf
    rig.rotation.x = 0.06 + Math.sin(t * 0.5) * 0.05;
    rig.position.z = Math.sin(t * 0.8) * 0.05;
    warm.position.set(Math.sin(t * 0.6) * 3, 2.5, 4);
    glow.value = 0.2 + 0.08 * Math.sin(t * 2.2);
    VHS.tick(t);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function show() {
    if (open) return; open = true;
    if (window.track) window.track("konami");
    const main = document.querySelector("main");
    if (main) { main.classList.add("is-glitching"); setTimeout(() => main.classList.remove("is-glitching"), 700); }   // the tracking goes for a beat first
    if (window.Sound) { window.Sound.play("static", 0.6); setTimeout(() => window.Sound.play("insert"), 500); }
    box.classList.add("is-on"); box.setAttribute("aria-hidden", "false");
    resize(); if (!raf) raf = requestAnimationFrame(frame);
    if (window.lenis) window.lenis.stop();
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: .6, delay: .3, ease: "power2.out" });
    gsap.fromTo(canvas, { opacity: 0, y: 36, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: .75, ease: "power3.out", clearProps: "transform" });   // the tape rises into the light after the message
    gsap.fromTo(box.querySelectorAll(".konami-copy > *"), { opacity: 0, y: 16, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .8, stagger: .14, delay: .7, ease: "power2.out", clearProps: "filter", onComplete: resize });
  }
  function hide() {
    if (!open) return;
    gsap.to(box, { opacity: 0, duration: .35, ease: "power2.in", onComplete: () => { open = false; box.classList.remove("is-on"); box.setAttribute("aria-hidden", "true"); if (window.lenis && !document.querySelector(".overlay.is-open")) window.lenis.start(); } });
  }
  box.addEventListener("click", e => { if (e.target.closest("a")) return; hide(); });   // the Where to watch link is the one thing that is not a way out
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) hide(); });
  window.__konami = { show, hide, get ready() { return ready; } };
}
