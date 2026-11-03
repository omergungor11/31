"use client";

import { useEffect } from "react";

const scripts = [
  "/vendor/gsap.min.js",
  "/vendor/ScrollTrigger.min.js",
  "/vendor/lenis.min.js",
  "/vendor/lottie.min.js",
  "/js/sound.js",
  "/js/fog.js",
  "/js/animations.js",
  "/js/watchlist.js",
  "/js/ratings.js",
  "/js/main.js",
];

export default function TapeRuntime({ films, bonusFilm }) {
  useEffect(() => {
    // The page-wide listeners belong to this document and survive strict-mode remounts.
    if (document.getElementById("tape-runtime")) return;
    window.FILMS = films;
    window.BONUS = bonusFilm;
    window.SYNC_URL = "/api/lists";
    for (const src of scripts) {
      const script = document.createElement("script");
      script.async = false;
      script.src = src;
      if (src === "/js/main.js") script.id = "tape-runtime";
      document.body.appendChild(script);
    }
    const scene = document.createElement("script");
    scene.type = "module";
    scene.src = "/js/zombie.js";
    document.body.appendChild(scene);
  }, [films, bonusFilm]);

  return null;
}
