import { errorResponse, json, readJson, requireAdmin } from "../../_lib/http.js";
import { dbColumns, editable, fromRow, insertValues, validateProfile } from "../../_lib/profiles.js";

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const { results } = await env.DB.prepare("SELECT * FROM profiles ORDER BY created_at DESC").all();
  return json(results.map(fromRow));
}

export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  try {
    const data = await readJson(request);
    const validationError = validateProfile(data);
    if (validationError) return json({ error: validationError }, 400);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const columns = ["id", "active", ...editable.map((key) => dbColumns[key]), "created_at", "updated_at"];
    const placeholders = columns.map(() => "?").join(",");
    const values = [id, data.active === false ? 0 : 1, ...insertValues(data), now, now];
    await env.DB.prepare(`INSERT INTO profiles (${columns.join(",")}) VALUES (${placeholders})`).bind(...values).run();
    return json({ id }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
