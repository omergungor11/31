import { database } from "../../../../lib/store";
import { films } from "../../../../lib/films";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugs = new Set(films.map(film => film.slug));
const validId = id => /^[a-z0-9]{8,24}$/.test(id);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const time = value => Number.isSafeInteger(value) && value >= 0;
const text = (value, length) => typeof value === "string" && value.length <= length;
const year = value => typeof value === "string" && /^\d{0,4}$/.test(value);

function validList(list) {
  if (!object(list) || list.v !== 1 || !time(list.updatedAt)) return false;
  if (!object(list.watched) || !object(list.swaps) || !Array.isArray(list.custom)) return false;
  return Object.entries(list.watched).every(([slug, at]) => slugs.has(slug) && time(at)) &&
    Object.entries(list.swaps).every(([slug, swap]) =>
      slugs.has(slug) && object(swap) && text(swap.title, 120) && year(swap.year) && time(swap.at)) &&
    list.custom.every(item =>
      object(item) && validId(item.id) && text(item.title, 120) && year(item.year) &&
      text(item.note, 280) && time(item.added) && (item.watched === null || time(item.watched)));
}

export async function GET(request, { params }) {
  const { id } = await params;
  if (!validId(id)) return new Response(null, { status: 400 });
  const row = database().prepare("SELECT payload FROM watchlists WHERE id = ?").get(id);
  if (!row && new URL(request.url).searchParams.has("optional")) return Response.json(null, { headers: { "Cache-Control": "no-store" } });
  if (!row) return new Response(null, { status: 404 });
  return new Response(row.payload, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  if (!validId(id)) return new Response(null, { status: 400 });
  const body = await request.text();
  if (body.length > 65536) return new Response(null, { status: 413 });
  let list;
  try { list = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  if (!validList(list)) return new Response(null, { status: 400 });
  database().prepare(`
    INSERT INTO watchlists (id, updated, payload) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET updated = excluded.updated, payload = excluded.payload
    WHERE excluded.updated >= watchlists.updated
  `).run(id, list.updatedAt, JSON.stringify({
    v: 1, updatedAt: list.updatedAt, watched: list.watched, swaps: list.swaps, custom: list.custom,
  }));
  return new Response(null, { status: 204 });
}
