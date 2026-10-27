import { errorResponse, json, readJson, requireAdmin } from "../../_lib/http.js";
import { dbColumns, editable, insertValues, validateProfile } from "../../_lib/profiles.js";

export async function onRequestPut({ request, env, params }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  try {
    const data = await readJson(request);
    const validationError = validateProfile(data);
    if (validationError) return json({ error: validationError }, 400);
    const now = new Date().toISOString();
    const assignments = ["active = ?", ...editable.map((key) => `${dbColumns[key]} = ?`), "updated_at = ?"].join(",");
    const values = [data.active === false ? 0 : 1, ...insertValues(data), now, params.id];
    const result = await env.DB.prepare(`UPDATE profiles SET ${assignments} WHERE id = ?`).bind(...values).run();
    if (!result.meta.changes) return json({ error: "الملف غير موجود." }, 404);
    return json({ id: params.id });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestDelete({ request, env, params }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const result = await env.DB.prepare("DELETE FROM profiles WHERE id = ?").bind(params.id).run();
  if (!result.meta.changes) return json({ error: "الملف غير موجود." }, 404);
  return json({ ok: true });
}
