/* Votes are remembered in this browser and counted by this installation. */
window.Ratings = (() => {
  const listeners = new Set();
  const cache = new Map();
  const loading = new Map();
  const saving = new Map();
  const storageKey = "v31_ratings";
  const voter = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, "0")).join("");
  let state = { voter, votes: {} };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored?.voter && stored.votes) state = stored;
  } catch {}
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }
  persist();

  function paint(slug, totals) {
    cache.set(slug, totals);
    for (const listener of listeners) listener(slug);
    return totals;
  }

  async function send(slug) {
    const vote = state.votes[slug];
    const response = await fetch("/api/ratings/" + slug, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: vote.kind, voter: state.voter }),
    });
    if (!response.ok) throw new Error("Could not save vote");
    const totals = await response.json();
    vote.pending = false;
    persist();
    return paint(slug, totals);
  }

  function save(slug) {
    if (saving.has(slug)) return saving.get(slug);
    const request = send(slug).catch(() => cache.get(slug)).finally(() => saving.delete(slug));
    saving.set(slug, request);
    return request;
  }

  function load(slug) {
    if (state.votes[slug]?.pending) return save(slug);
    if (cache.has(slug)) return Promise.resolve(cache.get(slug));
    if (loading.has(slug)) return loading.get(slug);
    const request = fetch("/api/ratings/" + slug)
      .then(response => response.ok ? response.json() : null)
      .then(totals => cache.get(slug) || paint(slug, totals || { like: 0, dislike: 0 }))
      .catch(() => cache.get(slug) || paint(slug, { like: 0, dislike: 0 }))
      .finally(() => loading.delete(slug));
    loading.set(slug, request);
    return request;
  }

  function vote(slug, kind) {
    if (state.votes[slug]) return;
    state.votes[slug] = { kind, pending: true };
    persist();
    const totals = { like: 0, dislike: 0, ...cache.get(slug) };
    totals[kind] += 1;
    paint(slug, totals);
    return save(slug);
  }

  return { load, vote, myVote: slug => state.votes[slug]?.kind, get: slug => cache.get(slug), onChange: fn => listeners.add(fn) };
})();
