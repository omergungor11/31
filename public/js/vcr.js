/* Final section — a VHS player (Meshy model, assets/models/vhs-player.glb) with a cassette hovering at its slot.
   Click: the tape slides in, the screen cuts to static, and a click on the static rewinds to the top of the page. */
import * as THREE from "three";
import * as VHS from "./vhs3d.js?v=20261026a";

const canvas = document.getElementById("vcr");
if (canvas) init();

function init() {
  const section = canvas.closest(".vcr");
  const renderer = VHS.renderer(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 1.2, 6.6);
  camera.lookAt(0, -0.1, 0);

  VHS.environment(renderer, scene);
  const { warm } = VHS.lights(scene, 3.6);
  const glow = { value: 0.18 };

  const rig = new THREE.Group(); scene.add(rig);
  rig.rotation.x = 0.22;
  const SLOT = { x: 0.35, y: 0.14, z: 0.80 };         // cassette slot on the front face, in model units

  /* ---- the cassette: the same modelled VHS as the shelf (assets/models/vhs-tape-model.glb), lying flat, face up,
     its "insert this side" edge toward the player. The OBJ is thinner than a real tape, so the shell is deepened to
     real proportions (187 x 103 x 25 mm) at the 0.84 unit length the scene was built around. ---- */
  const tape = new THREE.Group();
  tape.position.set(SLOT.x, SLOT.y + 0.02, SLOT.z + 0.55);
  rig.add(tape);
  const tapeHome = tape.position.clone();
  VHS.gltfLoader().load("assets/models/vhs-tape-model.glb", gltf => {
    let src; gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
    src.updateWorldMatrix(true, false);
    const geo = src.geometry.clone().applyMatrix4(src.matrixWorld); geo.computeBoundingBox();
    const size = geo.boundingBox.getSize(new THREE.Vector3()), center = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-center.x, -center.y, -center.z);
    const L = 0.84, k = L / size.x;
    geo.scale(k, (L * 25 / 187) / size.y, k);
    const m = src.material; m.metalness = 0; m.metalnessMap = null; m.roughness = Math.max(m.roughness ?? 0.5, 0.5);
    VHS.treat(m, { glow, cacheKey: "vhs-tape-model" });
    m.envMapIntensity = 0.5; m.emissiveMap = m.map; m.emissive.set(0xffffff); m.emissiveIntensity = 0.15;
    const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; tape.add(mesh);
  }, undefined, err => console.error("tape model failed", err));

  let ready = false, fitScale = 1;
  VHS.gltfLoader().load("assets/models/vhs-player.glb", gltf => {
    const root = gltf.scene;
    root.traverse(o => { if (o.isMesh) { o.frustumCulled = false; VHS.treat(o.material, { glow, cacheKey: "vhs-vcr" }); } });
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    root.position.sub(center);
    rig.add(root);
    fitScale = 3.4 / size.x;
    ready = true;
    window.__vcr.ready = true;
  }, undefined, err => console.error("vhs player load failed", err));

  /* ---- interaction ---- */
  const statik = document.getElementById("static");
  const noise = statik.querySelector("canvas"), nctx = noise.getContext("2d");
  noise.width = 240; noise.height = 160;
  const img = nctx.createImageData(noise.width, noise.height);
  let staticOn = false, busy = false, inserted = false;
  function drawNoise() {
    if (!staticOn) return;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nctx.putImageData(img, 0, 0);
    requestAnimationFrame(drawNoise);
  }
  function insert() {
    if (window.track) window.track("rewind");
    if (busy || inserted) return; busy = true;
    if (window.Sound) setTimeout(() => window.Sound.play("insert"), 500);         // as the tape meets the slot: click, motor, carriage, latch
    gsap.timeline({ onComplete: () => { busy = false; inserted = true; showStatic(); } })
      .to(tape.position, { x: SLOT.x, y: SLOT.y, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(tape.rotation, { x: 0, z: 0, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(tape.position, { z: SLOT.z + 0.18, duration: 0.6, ease: "power2.in" }, 0.45)
      .to(tape.position, { z: SLOT.z - 0.32, duration: 0.7, ease: "power3.inOut" }, 1.15)
      .to(rig.position, { y: "-=0.04", duration: 0.08, yoyo: true, repeat: 1 }, 1.75);
  }
  function eject() {
    inserted = false;
    gsap.timeline()
      .to(tape.position, { z: SLOT.z + 0.18, duration: 0.6, ease: "power2.out" })
      .to(tape.position, { x: tapeHome.x, y: tapeHome.y, z: tapeHome.z, duration: 0.8, ease: "power2.inOut" });
  }
  function showStatic() {
    staticOn = true; statik.classList.add("is-on"); drawNoise();
    if (window.Sound) window.Sound.snowStart();                 // the snow hisses for as long as it is on screen
    gsap.fromTo(statik, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" });
    gsap.fromTo(statik.querySelector(".static-copy"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power2.out" });
  }
  const TOUCH = matchMedia("(pointer: coarse), (hover: none)").matches;
  const hintEl = statik.querySelector(".static-hint"); if (hintEl && TOUCH) hintEl.textContent = "Tap anywhere to go back to the start of the tape";
  // typed "rewind" anywhere on the page: straight to the snow, then the whirr back to the top
  function rewindNow() {
    if (staticOn) { rewind(); return; }
    if (busy) return;
    showStatic(); setTimeout(rewind, 900);
  }
  function rewind() {
    if (!staticOn) return;
    if (window.Sound) { window.Sound.snowStop(); window.Sound.play("rewind"); }   // assets/audio/rewind.mp3: the tape whirring back
    gsap.to(statik.querySelector(".static-copy"), { opacity: 0, duration: 0.3 });
    const done = () => { staticOn = false; statik.classList.remove("is-on"); eject(); };
    if (TOUCH) {
      // on a phone the page jumps to the top behind the snow: flying back through the pinned sections while the
      // browser's own bars come and go looks like a broken tape, so the snow holds for the whirr, then lifts on the hero
      gsap.delayedCall(1.1, () => { if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); if (window.ScrollTrigger) ScrollTrigger.update(); });
      gsap.to(statik, { opacity: 0, duration: 0.9, delay: 1.4, ease: "power2.inOut", onComplete: done });
      return;
    }
    if (window.lenis) window.lenis.scrollTo(0, { duration: 2.2, easing: t => 1 - Math.pow(1 - t, 3) });
    gsap.to(statik, { opacity: 0, duration: 1.4, delay: 0.9, ease: "power2.inOut", onComplete: done });
  }
  window.__vcr = { rig, tape, insert, eject, SLOT, rewindNow, ready: false };   // published at once, so a typed "rewind" works before the player model lands
  section.querySelector(".vcr-hit").addEventListener("click", insert);
  statik.addEventListener("click", rewind);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && staticOn) rewind(); });

  /* ---- pointer, sizing, loop ---- */
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasPointer = matchMedia("(pointer:fine)").matches;
  const target = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  if (hasPointer && !REDUCED) addEventListener("pointermove", e => {
    const r = section.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    target.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  }, { passive: true });
  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();
  let visible = false, running = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) requestAnimationFrame(frame); }).observe(canvas);

  const start = performance.now();
  function frame(now) {
    running = true;
    if (!visible) { running = false; return; }
    const t = REDUCED ? 0 : (now - start) / 1000;             // reduced motion: no idle drift, no grain crawl
    mouse.x += (target.x - mouse.x) * 0.05; mouse.y += (target.y - mouse.y) * 0.05;
    warm.position.set(mouse.x * 4 - 1, mouse.y * 2 + 2, 3); VHS.tick(t);
    glow.value = 0.14 + 0.06 * Math.sin(t * 1.7);
    const wide = Math.min(1, Math.max(0, (camera.aspect - 0.9) / 0.7));
    rig.scale.setScalar(fitScale * (0.40 + 0.60 * wide) * (1 - wide * 0.08));   // a shade smaller on wide screens
    rig.position.y = -0.45 + (1 - wide) * 0.25 + wide * 0.42;                  // and higher, so the hovering cassette clears the fold on 16:9 and 16:10 screens
    rig.rotation.y = mouse.x * 0.18 + Math.sin(t * 0.3) * 0.03;
    rig.rotation.x = 0.22 - mouse.y * 0.05;
    if (!inserted && !busy) {                              // the cassette hovers, waiting
      tape.position.y = tapeHome.y + Math.sin(t * 1.3) * 0.04;
      tape.rotation.z = Math.sin(t * 0.9) * 0.05;
      tape.rotation.x = Math.sin(t * 1.1) * 0.04;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
