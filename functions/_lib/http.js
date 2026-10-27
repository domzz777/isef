export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) mismatch |= (a[i] || 0) ^ (b[i] || 0);
  return mismatch === 0;
}

export function requireAdmin(request, env) {
  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) {
    return json({ error: "إعدادات دخول الإدارة غير مكتملة." }, 503);
  }
  const match = (request.headers.get("Authorization") || "").match(/^Basic\s+(.+)$/i);
  if (!match) return json({ error: "بيانات دخول الإدارة مطلوبة." }, 401);

  try {
    const bytes = Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const separator = decoded.indexOf(":");
    if (separator < 0) return json({ error: "بيانات الدخول غير صحيحة." }, 401);
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (!constantTimeEqual(user, env.ADMIN_USER) || !constantTimeEqual(password, env.ADMIN_PASSWORD)) {
      return json({ error: "بيانات الدخول غير صحيحة." }, 401);
    }
    return null;
  } catch {
    return json({ error: "بيانات الدخول غير صحيحة." }, 401);
  }
}

export async function readJson(request) {
  const text = await request.text();
  if (text.length > 32 * 1024) throw new Error("حجم البيانات أكبر من المسموح.");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("صيغة البيانات غير صحيحة.");
  }
}

export function errorResponse(error) {
  return json({ error: error.message || "حدث خطأ بالخادم." }, 400);
}
