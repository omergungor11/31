import { database } from "../../../../lib/store";
import { films } from "../../../../lib/films";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugs = new Set(films.map(film => film.slug));

function counts(slug) {
  const rows = database().prepare("SELECT kind, COUNT(*) AS total FROM votes WHERE slug = ? GROUP BY kind").all(slug);
  const result = { like: 0, dislike: 0 };
  for (const row of rows) result[row.kind] = row.total;
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request, { params }) {
  const { slug } = await params;
  if (!slugs.has(slug)) return new Response(null, { status: 404 });
  return counts(slug);
}

export async function POST(request, { params }) {
  const { slug } = await params;
  if (!slugs.has(slug)) return new Response(null, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || !["like", "dislike"].includes(body.kind) || typeof body.voter !== "string" ||
      !/^[0-9a-f]{32}$/.test(body.voter)) return new Response(null, { status: 400 });
  database().prepare("INSERT OR IGNORE INTO votes (slug, voter, kind) VALUES (?, ?, ?)").run(slug, body.voter, body.kind);
  return counts(slug);
}
