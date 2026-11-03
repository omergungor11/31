import Films from "./Films";
import { Chrome, Ending, Hero } from "./Scene";
import Views from "./Views";
import TapeRuntime from "./TapeRuntime";
import { films, bonusFilm } from "../lib/films";

const importMap = {
  imports: {
    three: "/vendor/three/build/three.module.js",
    "three/addons/": "/vendor/three/examples/jsm/",
  },
};

export default function TapeExperience() {
  return (
    <>
      <script type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify(importMap) }} />
      <Chrome />
      <main>
        <Hero />
        <Films />
        <Ending />
      </main>
      <Views />
      <TapeRuntime films={films} bonusFilm={bonusFilm} />
    </>
  );
}
