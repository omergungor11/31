export function Chrome() {
  return (
    <>
      <div id="intro" aria-hidden="true">
        <canvas className="intro-noise"></canvas>
        <div className="intro-blue"></div>
        <div className="intro-osd">
          <span className="l">PLAY ▶</span>
          <span className="r">SP</span>
        </div>
        <div className="intro-track"></div>
        <p className="intro-skip">Click to skip</p>
      </div>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
        focusable="false"
      >
        <filter
          id="vhs-chroma"
          colorInterpolationFilters="sRGB"
          x="-2%"
          y="-2%"
          width="104%"
          height="104%"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset in="r" dx="1.3" dy="0" result="rs" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="gb"
          />
          <feOffset in="gb" dx="-0.7" dy="0" result="gbs" />
          <feBlend in="rs" in2="gbs" mode="screen" result="split" />
          <feGaussianBlur in="split" stdDeviation="0.3 0.08" result="soft" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0 0.9"
            numOctaves="1"
            seed="3"
            result="lines"
          />
          <feDisplacementMap
            in="soft"
            in2="lines"
            scale="1.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div id="cursor" aria-hidden="true">
        <span className="cur-chip">POP IN THE TAPE ▶</span>
        <svg
          className="cur knife"
          viewBox="40 40 500 540"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="blade"
            d="M72.7 52C75.0 53.1 76.5 53.5 78.4 55.4C81.7 58.5 84.8 61.7 88.0 64.9L105.2 82.1L159.1 136.0L236.7 213.5L262.4 239.3C265.2 242.1 268.1 244.8 270.9 247.8C274.8 251.9 281.1 255.9 277.9 262.4C276.4 265.4 271.3 267.8 268.2 265.7C262.9 262.2 254.2 251.5 249.9 248.1C243.3 242.8 190.0 186.4 187.0 185.6C186.2 186.5 185.5 188.8 184.8 190.3C183.9 191.8 183.0 193.2 181.9 194.6C179.1 198.2 174.9 201.9 171.7 205.2C167.4 209.6 162.4 213.3 162.5 220.1C162.5 222.6 163.3 225.1 164.7 227.2C166.2 229.7 170.7 234.0 173.0 236.3L187.9 251.1C192.6 255.8 199.8 262.3 202.8 267.9C205.8 273.2 206.9 279.3 206.2 285.3C204.6 298.1 195.8 304.0 187.5 312.6C183.3 316.9 180.2 319.5 180.3 326.1C180.4 333.5 186.3 336.6 190.4 341.8C198.2 351.6 198.9 363.4 193.3 374.4L234.9 416.0L248.3 429.4C251.4 432.6 257.5 440.8 262.3 436.5C266.0 433.1 269.6 429.3 273.2 425.8L293.5 405.4L330.7 368.2C337.1 361.8 343.5 355.4 349.9 349.0C350.0 348.9 350.2 348.7 350.3 348.6L307.1 305.3L295.2 293.4C292.9 291.1 289.9 288.5 288.1 285.9C284.7 281.2 288.9 274.1 294.6 274.5C299.7 274.9 304.8 281.8 308.5 285.5L332.5 309.4L399.0 375.9L469.5 446.4L492.4 469.3C496.3 473.2 501.4 478.0 505.1 482.1C514.0 491.9 518.6 504.9 517.8 518.2C517.0 531.6 511.1 543.2 501.1 552.1C495.7 556.8 489.3 560.2 482.4 562.0C481.0 562.4 475.9 563.5 475.1 564H463.0C462.0 563.4 457.5 562.5 456.1 562.1C443.8 559.2 436.0 551.0 427.4 542.4L410.5 525.4L398.3 513.4C395.3 510.4 390.3 506.4 390.0 502.0C389.9 500.0 390.6 498.1 392.0 496.7C398.9 489.7 405.9 499.7 410.5 504.2L432.7 526.5C438.0 531.7 446.3 540.7 452.2 544.3C457.3 547.3 463.0 548.9 468.9 548.9C477.9 549.0 486.6 545.4 493.0 539.1C499.4 532.7 502.9 524.1 502.9 515.1C502.7 498.2 492.8 491.0 481.9 480.1L454.8 453.0L361.2 359.4C359.5 360.5 356.0 364.1 354.5 365.7L343.8 376.4L324.2 396.0C320.8 399.4 316.5 403.5 313.3 407.0C328.7 422.9 345.0 438.2 360.4 454.1C364.2 458.0 368.2 461.7 371.9 465.7C376.1 470.1 386.0 476.6 380.1 483.5C378.8 485.1 376.8 486.0 374.7 486.1C370.1 486.4 365.6 480.7 362.5 477.5L352.4 467.3L320.5 435.5C315.0 430.0 308.2 422.8 302.5 417.7L282.9 437.3C274.7 445.5 267.6 455.3 254.4 452.4C247.7 450.8 244.3 446.7 239.5 442.0C237.0 439.6 234.5 437.1 232.1 434.6L206.8 409.3L165.7 368.2C155.6 358.1 144.4 347.3 134.9 336.8C112.4 311.7 93.9 283.3 80.1 252.6C76.8 245.3 73.9 237.9 71.1 230.4C69.5 226.1 65.6 217.7 68.3 213.5C69.4 211.8 71.2 210.5 73.3 210.2C79.8 209.0 81.4 214.1 83.0 218.7L85.4 225.7C99.1 263.3 119.9 297.8 146.8 327.5C156.7 338.5 168.0 348.8 178.3 359.4C179.1 360.3 180.4 361.8 181.3 362.4L181.7 362.2C182.2 361.2 181.9 359.8 181.8 358.7C181.0 350.2 173.5 347.5 169.4 340.7C166.7 336.0 165.5 332.1 165.3 326.6C164.5 309.6 177.0 302.8 187.2 291.7C191.5 286.9 192.6 281.2 189.8 275.3C188.5 272.7 183.5 268.1 181.2 265.8L165.2 249.8C154.5 239.2 145.2 231.7 148.0 214.9C149.9 202.6 161.0 195.4 168.8 186.8C173.3 181.8 174.7 173.9 170.1 168.6C165.9 163.6 160.4 158.6 155.7 153.9L126.9 125.1L90.7 88.9C85.2 83.4 76.8 74.4 71.2 69.7C70.1 78.5 68.9 86.3 68.1 95.2C66.6 112.1 66.6 129.1 68.0 146.0C68.5 151.9 69.1 157.8 70.0 163.6C70.5 167.7 74.1 185.1 73.4 188.0C73.0 189.9 71.7 191.4 70.0 192.3C68.2 193.4 66.1 193.7 64.1 193.1C62.1 192.5 60.6 191.1 59.7 189.2C57.7 185.5 57.1 178.4 56.4 174.0C51.0 142.2 50.5 109.8 54.9 77.9C55.6 72.6 56.4 66.1 57.8 61.0C59.3 55.4 62.6 54.3 67.0 52H72.7Z"
          />
          <g className="drops">
            <path
              className="drop"
              d="M165.7 438.1C168.7 433.1 172.9 431.6 178.5 432.0C182.7 432.9 185.3 434.5 187.4 438.4C193.7 449.4 200.6 460.3 206.3 471.6C209.1 477.3 209.5 485.4 208.2 491.5C206.2 499.9 201.0 507.3 193.6 511.9C187.6 515.7 181.4 517.1 174.4 516.8C165.9 516.3 157.9 512.4 152.2 505.9C146.4 499.4 143.5 490.8 144.1 482.0C144.4 476.5 146.1 471.8 148.9 467.1C154.5 457.4 159.9 447.7 165.7 438.1ZM176.7 449.6C175.5 450.6 161.6 474.8 160.6 477.1C159.8 478.8 159.3 480.7 159.1 482.7C158.7 487.3 160.1 491.9 163.1 495.5C166.6 499.7 170.7 501.3 176.0 501.7C184.3 501.4 190.9 497.3 193.3 489.0C194.1 486.1 194.2 483.0 193.4 480.1C192.3 476.1 188.9 470.9 186.8 467.2C183.5 461.3 179.9 455.5 176.7 449.6Z"
            />
            <path
              className="dot"
              d="M453.0 499.1C454.9 497.2 457.6 496.4 460.2 497.1C464.2 498.1 466.6 502.2 465.6 506.1C464.6 510.1 460.6 512.5 456.6 511.6C454.0 511.0 451.9 509.0 451.1 506.4C450.4 503.8 451.1 501.0 453.0 499.1Z"
            />
          </g>
        </svg>
      </div>
      <canvas id="fog" aria-hidden="true"></canvas>
      <div className="vhs" aria-hidden="true">
        <canvas className="vhs-noise"></canvas>
        <div className="vhs-scan"></div>
        <div className="vhs-rgb"></div>
        <div className="vhs-track"></div>
        <div className="vhs-vignette"></div>
      </div>
      <div className="osd osd-tl" aria-hidden="true">
        <span className="rec"></span>
        <span>REC</span>
        <span>SP</span>
        <span id="osd-day">OCT 01</span>
      </div>
      <button
        type="button"
        className="osd osd-bl"
        data-sound-toggle=""
        aria-pressed="false"
        aria-label="Sound"
        title="Sound"
      >
        <svg
          className="snd-ico"
          viewBox="0 0 28 22"
          width="28"
          height="22"
          aria-hidden="true"
        >
          <path className="snd-body" d="M3 8h4l6-5v16l-6-5H3z" />
          <path
            className="snd-wave"
            d="M17 7.5a4.5 4.5 0 0 1 0 7M20.5 4.5a9 9 0 0 1 0 13"
          />
          <path className="snd-x" d="M17 8l7 6M24 8l-7 6" />
        </svg>
      </button>
      <div className="osd osd-br" aria-hidden="true">
        <span>PLAY ▶</span>
        <span id="osd-time">0:00:00</span>
        <span id="osd-progress">0/31</span>
      </div>
      <div className="side-label" aria-hidden="true">
        31 for 31 · October 2026
      </div>
      <header className="topbar">
        <nav className="deck is-open" aria-label="View">
          <button
            type="button"
            className="deck-badge"
            aria-label="Back to the start"
            title="Back to the start"
          >
            <img
              src="/assets/svg/nav-badge.svg?v=1"
              alt=""
              width="50"
              height="50"
            />
          </button>
          <button
            type="button"
            className="deck-burger"
            aria-label="Open the menu"
            aria-expanded="false"
            aria-controls="menu"
          >
            <span></span>
            <span></span>
          </button>
          <div className="deck-links">
            <div className="deck-links-in">
              <button data-view="scroll" className="is-on" data-label="Scroll">
                Scroll
              </button>
              <button data-view="gallery" data-label="Shelf">
                Shelf
              </button>
              <button data-view="list" data-label="List">
                List
              </button>
              <button data-view="mine" data-label="My list">
                <span className="lbl">My list</span>{" "}
                <b className="badge" id="deck-progress">
                  [0/31]
                </b>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <div className="menu" id="menu" aria-hidden="true">
        <nav className="menu-links" aria-label="Views">
          <button data-view="scroll" className="is-on">
            Scroll
          </button>
          <button data-view="gallery">Shelf</button>
          <button data-view="list">List</button>
          <button data-view="mine">
            My list{" "}
            <b className="pill" id="menu-progress">
              0
            </b>
          </button>
        </nav>
      </div>
    </>
  );
}

export function Hero() {
  return (
    <>
      <section className="hero">
        <canvas id="glove" aria-hidden="true"></canvas>
        <div className="hero-inner">
          <h1 className="title">
            <img
              className="mark"
              src="/assets/svg/hero-type.svg?v=4"
              alt="31 for 31"
              width="965"
              height="452"
              decoding="async"
              fetchPriority="high"
            />
          </h1>
          <p className="sub">
            One scary movie for every night of October. Thirty one tapes,
            rewound and ready. Scroll to press play.
          </p>
        </div>
        <div className="hero-tape"></div>
        <div className="scroll-cue" aria-hidden="true">
          <svg className="arrow" viewBox="0 0 24 40" width="24" height="40">
            <path d="M12 2v34M3 27l9 9 9-9" />
          </svg>
        </div>
      </section>
    </>
  );
}

export function Ending() {
  return (
    <>
      <section className="rise" id="rise" aria-label="Something in the dark">
        <canvas id="evil" aria-hidden="true">
          <div className="rise-dof" aria-hidden="true"></div>
        </canvas>
      </section>
      <section className="rewind-head" aria-label="Be kind, rewind">
        <p className="bkr">Be kind, rewind.</p>
      </section>
      <section className="vcr" id="rewind" aria-label="Rewind">
        <canvas id="vcr" aria-hidden="true"></canvas>
        <button
          className="vcr-hit"
          type="button"
          aria-label="Insert the tape and rewind to the top"
        ></button>
        <div className="vcr-copy">
          <h2>Click the player to rewind.</h2>
        </div>
      </section>
      <footer className="footer">
        <p>
          Thirty one films, thirty one nights. Likes and dislikes are shared
          with everyone who visits. One vote per film, per browser.
        </p>
        <p>
          Posters belong to their respective studios and are shown here for
          commentary and recommendation. Streaming links open a search on each
          service, so availability depends on your region.
        </p>
        <p className="credits">
          Made by Meredith McGrade · Type lockups set in Zombie Punks · Saans
          and Saans Mono by Displaay · Tapes, cases and player modelled in
          Blender, with a Meshy scan · Built with three.js, GSAP and Lenis
        </p>
      </footer>
    </>
  );
}

export function Badge() {
  return (
    <>
      <div id="awwwards">
        <a
          href="https://www.awwwards.com/sites/31-for-31"
          target="_blank"
          rel="noopener"
          aria-label="31 for 31 on Awwwards, vote for it"
        >
          <svg
            width="53.08"
            height="171.358"
            viewBox="0 0 53.08 171.358"
            aria-hidden="true"
          >
            <path
              className="js-color-bg"
              fill="white"
              d="M0 0h53.08v171.358H0z"
            ></path>
            <g className="js-color-text" fill="black">
              <path d="M20.048 153.585v-2.002l6.752-3.757h-6.752v-1.9h10.23v2.002l-6.752 3.757h6.752v1.9zM29.899 142.382a3.317 3.317 0 0 1-1.359 1.293c-.575.297-1.223.446-1.944.446-.721 0-1.369-.149-1.944-.446a3.317 3.317 0 0 1-1.359-1.293c-.331-.564-.497-1.232-.497-2.003 0-.769.166-1.437.497-2.002a3.332 3.332 0 0 1 1.359-1.294c.575-.297 1.224-.445 1.944-.445.722 0 1.369.148 1.944.445a3.326 3.326 0 0 1 1.359 1.294c.33.565.496 1.233.496 2.002.001.77-.166 1.438-.496 2.003m-1.703-3.348c-.435-.331-.967-.497-1.601-.497s-1.167.166-1.601.497c-.434.332-.65.78-.65 1.345s.217 1.014.65 1.346c.434.33.967.496 1.601.496s1.166-.166 1.601-.496c.434-.332.649-.78.649-1.346.001-.565-.215-1.013-.649-1.345M22.912 134.996v-1.812h1.185c-.43-.283-.752-.593-.973-.929-.219-.336-.329-.732-.329-1.19 0-.479.127-.902.38-1.272.254-.37.635-.633 1.141-.79-.478-.262-.851-.591-1.118-.985a2.221 2.221 0 0 1-.402-1.265c0-.682.2-1.218.599-1.607.4-.391.957-.585 1.668-.585h5.218v1.812H25.37c-.682 0-1.023.303-1.023.907 0 .467.264.85.789 1.146.527.299 1.286.446 2.28.446h2.865v1.813H25.37c-.682 0-1.023.303-1.023.906 0 .468.275.851.826 1.147.551.298 1.352.446 2.404.446h2.704v1.812h-7.369zM21.626 122.457c-.225.224-.502.336-.833.336s-.608-.112-.833-.336a1.128 1.128 0 0 1-.336-.833c0-.331.111-.609.336-.833.225-.225.502-.336.833-.336s.608.111.833.336c.225.224.337.502.337.833 0 .332-.112.608-.337.833m1.286-1.739h7.366v1.813h-7.366v-1.813zM22.912 118.668v-1.812h1.185a3.348 3.348 0 0 1-.951-1.009 2.434 2.434 0 0 1-.351-1.272c0-.681.19-1.229.57-1.644.38-.414.931-.621 1.651-.621h5.263v1.812h-4.722c-.418 0-.727.096-.92.285-.195.19-.293.447-.293.769 0 .302.116.58.351.833.233.254.577.458 1.03.613.453.156.992.234 1.615.234h2.938v1.812h-7.366zM29.833 109.129a3.33 3.33 0 0 1-1.432 1.169 4.535 4.535 0 0 1-1.805.373 4.537 4.537 0 0 1-1.807-.373c-.579-.248-1.057-.638-1.432-1.169s-.563-1.196-.563-1.995c0-.771.183-1.413.549-1.93a3.28 3.28 0 0 1 1.382-1.141 4.221 4.221 0 0 1 1.709-.364h.746v5.071c.447-.02.838-.183 1.168-.49.332-.307.498-.724.498-1.248 0-.41-.093-.754-.277-1.031-.186-.278-.473-.529-.863-.753l.542-1.462c.69.303 1.224.724 1.592 1.265.371.541.556 1.235.556 2.083 0 .799-.188 1.464-.563 1.995m-4.085-3.574c-.41.088-.746.261-1.009.52-.262.258-.395.61-.395 1.06 0 .428.137.784.409 1.067.272.282.604.458.994.525v-3.172zM29.833 100.878c-.375.531-.852.921-1.432 1.169a4.552 4.552 0 0 1-3.612 0c-.579-.248-1.057-.638-1.432-1.169s-.563-1.196-.563-1.995c0-.77.183-1.412.549-1.93a3.278 3.278 0 0 1 1.382-1.14 4.222 4.222 0 0 1 1.709-.365h.746v5.072a1.794 1.794 0 0 0 1.168-.49c.332-.307.498-.724.498-1.249 0-.41-.093-.753-.277-1.031-.186-.277-.473-.528-.863-.753l.542-1.462c.69.302 1.224.724 1.592 1.265.371.541.556 1.234.556 2.083 0 .799-.188 1.464-.563 1.995m-4.085-3.573c-.41.088-.746.261-1.009.519-.262.258-.395.611-.395 1.06 0 .429.137.784.409 1.067.272.282.604.458.994.526v-3.172zM35.481 16.926l-4.782 14.969h-3.266l-2.584-9.682-2.584 9.682h-3.268l-4.781-14.969h3.713l2.673 10.276 2.524-10.276h3.445l2.524 10.276 2.674-10.276zM37.979 27.083c1.426 0 2.495 1.068 2.495 2.495 0 1.425-1.069 2.495-2.495 2.495-1.425 0-2.495-1.07-2.495-2.495-.001-1.427 1.07-2.495 2.495-2.495"></path>
            </g>
          </svg>
        </a>
      </div>
    </>
  );
}
