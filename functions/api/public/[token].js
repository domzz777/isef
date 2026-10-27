import { json } from "../../_lib/http.js";
import { publicFromRow } from "../../_lib/profiles.js";

export async function onRequestGet({ env, params }) {
  const token = params.token || "";
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return json({ error: "غير موجود." }, 404);
  const row = await env.DB.prepare("SELECT * FROM profiles WHERE public_token = ? AND active = 1").bind(token).first();
  if (!row) return json({ error: "غير موجود." }, 404);
  return json(publicFromRow(row));
}
