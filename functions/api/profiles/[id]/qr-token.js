import { json, requireAdmin } from "../../../_lib/http.js";

function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export async function onRequestPost({ request, env, params }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const existing = await env.DB.prepare("SELECT public_token FROM profiles WHERE id = ?").bind(params.id).first();
  if (!existing) return json({ error: "الملف غير موجود." }, 404);
  const token = existing.public_token || makeToken();
  if (!existing.public_token) {
    await env.DB.prepare("UPDATE profiles SET public_token = ?, updated_at = ? WHERE id = ?")
      .bind(token, new Date().toISOString(), params.id).run();
  }
  return json({ token });
}
