export default function Views() {
  return (
    <>
      <div id="konami" aria-hidden="true">
        <canvas className="konami-hand" aria-hidden="true"></canvas>
        <div className="konami-copy">
          <p className="osd-line">
            <span className="rec"></span>BONUS TAPE
          </p>
          <p className="konami-msg">
            Congrats,
            <br />
            you're one spooky b*tch
          </p>
          <p className="konami-body">
            You're so f*ckin spooky that 31 films weren't enough, and you've
            unlocked a bonus film. This one should help get you into the coming
            season of lesser, non-Halloween holidays.
          </p>
          <p className="konami-film"></p>
          <p className="konami-hint">Click or press Escape to go back</p>
        </div>
      </div>
      <div id="static" aria-live="polite">
        <canvas aria-hidden="true"></canvas>
        <div className="static-copy">
          <p className="rew">◀◀ REW</p>
          <p className="static-hint">
            Click anywhere to go back to the start of the tape
          </p>
        </div>
      </div>
      <section
        className="overlay overlay--shelf"
        id="view-gallery"
        data-lenis-prevent=""
        aria-label="The shelf"
      >
        <canvas
          id="shelf"
          tabIndex="0"
          role="group"
          aria-label="The shelf. Thirty one tapes. Use the arrow keys to move along the shelf and Enter to open a night."
          aria-describedby="shelf-live"
        ></canvas>
        <p id="shelf-live" className="sr-only" aria-live="polite"></p>
        <p className="osd-loading shelf-loading" aria-hidden="true">
          <span className="rec"></span>LOADING TAPE
        </p>
        <h2>
          <img
            className="mark"
            loading="lazy"
            src="/assets/svg/shelf-type.svg?v=2"
            width="1139"
            height="664"
            alt="The shelf"
          />
        </h2>
        <p className="shelf-hint">
          Drag or use the arrow keys · click or press Enter to pull
        </p>
      </section>
      <section
        className="overlay"
        id="view-mine"
        data-lenis-prevent=""
        aria-label="My list"
      >
        <h2>
          <img
            className="mark"
            loading="lazy"
            src="/assets/svg/mylist-type.svg?v=2"
            width="1698"
            height="630"
            alt="My list"
          />
        </h2>
        <div className="mine">
          <div className="mine-progress">
            <div className="big">
              <span id="mine-done">0</span>
              <small>of 31 watched</small>
            </div>
            <div className="meter">
              <i id="mine-bar"></i>
            </div>
            <div className="mine-foot">
              <p className="hint" id="mine-hint">
                Tick films off as you go. Your progress is saved in this
                browser.
              </p>
              <div className="mine-share">
                <button type="button" className="stream share" id="share-list">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 10v3h10v-3M8 2v8M5 5l3-3 3 3" />
                  </svg>
                  Share my tape log
                </button>
              </div>
            </div>
          </div>
          <h3>The 31</h3>
          <p className="hint mine-intro">
            Your copy of the tape. Watch my picks or swap any night for a film
            of your own.
          </p>
          <ol className="checklist" id="checklist"></ol>
          <div className="sync">
            <h3>Sync to another device</h3>
            <div className="sync-body" id="sync-panel"></div>
          </div>
        </div>
      </section>
      <section
        className="overlay"
        id="view-list"
        data-lenis-prevent=""
        aria-label="Film list"
      >
        <h2>
          <img
            className="mark"
            loading="lazy"
            src="/assets/svg/lineup-type.svg?v=2"
            width="1338"
            height="570"
            alt="The lineup"
          />
        </h2>
        <div
          className="list-bar"
          role="toolbar"
          aria-label="Views, sort and filter"
        >
          <span className="list-count" id="list-count" title="Nights shown">
            31
          </span>
          <span className="list-done" id="list-done"></span>
          <div className="sel-wrap">
            <div className="sel" data-label="Sort by:" data-short="Sort:">
              <select
                id="list-sort"
                className="sr-only"
                aria-label="Sort by"
                tabIndex="-1"
              >
                <option value="day">Night</option>
                <option value="title">Title</option>
                <option value="director">Director</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div className="sel-wrap">
            <div className="sel" data-label="Show:" data-short="Show:">
              <select
                id="list-filter"
                className="sr-only"
                aria-label="Show"
                tabIndex="-1"
              >
                <option value="all">All</option>
                <option value="todo">Unwatched</option>
                <option value="done">Watched</option>
              </select>
            </div>
          </div>
        </div>
        <ol className="list" id="list"></ol>
      </section>
    </>
  );
}
