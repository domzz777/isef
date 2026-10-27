const editable = [
  'fullName', 'age', 'bloodType', 'caseType', 'contactName', 'contactPhone',
  'contactRelation', 'language', 'allergies', 'conditions', 'instructions',
  'insuranceName', 'insurancePhone', 'insuranceAddress', 'privateNotes',
];

const dbColumns = {
  fullName: 'full_name', age: 'age', bloodType: 'blood_type', caseType: 'case_type',
  contactName: 'contact_name', contactPhone: 'contact_phone',
  contactRelation: 'contact_relation', language: 'language', allergies: 'allergies',
  conditions: 'conditions', instructions: 'instructions', insuranceName: 'insurance_name',
  insurancePhone: 'insurance_phone', insuranceAddress: 'insurance_address',
  privateNotes: 'private_notes',
};

const limits = {
  privateNotes: 1000, conditions: 400, instructions: 400, allergies: 300,
  insuranceAddress: 250, insuranceName: 120, contactName: 100,
  contactRelation: 60, insurancePhone: 30, bloodType: 10, caseType: 100, language: 10,
};

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'صيغة البيانات غير صحيحة.';
  if (typeof data.fullName !== 'string' || !data.fullName.trim() || data.fullName.length > 100) {
    return 'الاسم مطلوب وبحد أقصى 100 حرف.';
  }
  if (typeof data.contactPhone !== 'string' || !data.contactPhone.trim() || data.contactPhone.length > 30) {
    return 'رقم جهة الاتصال مطلوب وبحد أقصى 30 حرفًا.';
  }
  if (data.age !== null && data.age !== '' && data.age !== undefined &&
      (!Number.isInteger(Number(data.age)) || Number(data.age) < 0 || Number(data.age) > 125)) {
    return 'السن يجب أن يكون رقمًا بين 0 و125.';
  }
  for (const key of editable) {
    if (key !== 'fullName' && key !== 'contactPhone' && key !== 'age' &&
        data[key] != null && String(data[key]).length > (limits[key] || 500)) {
      return `قيمة ${key} أطول من المسموح.`;
    }
  }
  return null;
}

async function readBody(request) {
  const raw = await request.text();
  if (raw.length > 32 * 1024) throw new Error('حجم البيانات أكبر من المسموح.');
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new Error('صيغة البيانات غير صحيحة.');
  }
}

function base64UrlToUtf8(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a[i] ^ b[i];
  return difference === 0;
}

function isAuthorized(request, env) {
  const expectedUser = env.ADMIN_USER;
  const expectedPassword = env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) return null;
  const match = (request.headers.get('Authorization') || '').match(/^Basic\s+(.+)$/i);
  if (!match) return false;
  let supplied;
  try {
    supplied = base64UrlToUtf8(match[1]);
  } catch {
    return false;
  }
  const separator = supplied.indexOf(':');
  if (separator < 0) return false;
  return constantTimeEqual(supplied.slice(0, separator), expectedUser) &&
    constantTimeEqual(supplied.slice(separator + 1), expectedPassword);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function profile(row) {
  const result = {
    id: row.id,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  for (const key of editable) result[key] = row[dbColumns[key]] ?? '';
  return result;
}

function dbValues(data) {
  return editable.map((key) => key === 'age' && data[key] !== '' && data[key] != null
    ? Number(data[key])
    : (data[key] ?? ''));
}

async function handle(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === 'GET' && pathname === '/api/health') return json({ ok: true });

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/public/')) {
    const auth = isAuthorized(request, env);
    if (auth === null) return json({ error: 'إعدادات دخول الإدارة غير مكتملة.' }, 503);
    if (!auth) {
      return json({ error: 'بيانات دخول الإدارة مطلوبة.' }, 401, {
        'WWW-Authenticate': 'Basic realm="Medical QR Admin", charset="UTF-8"',
      });
    }
  }

  if (method === 'GET' && pathname === '/api/profiles') {
    const { results } = await env.DB.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all();
    return json(results.map(profile));
  }

  if (method === 'POST' && pathname === '/api/profiles') {
    const data = await readBody(request);
    const error = validate(data);
    if (error) return json({ error }, 400);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const columns = ['id', 'active', ...editable.map((key) => dbColumns[key]), 'created_at', 'updated_at'];
    const values = [id, data.active === false ? 0 : 1, ...dbValues(data), now, now];
    const placeholders = columns.map(() => '?').join(',');
    await env.DB.prepare(`INSERT INTO profiles (${columns.join(',')}) VALUES (${placeholders})`)
      .bind(...values).run();
    return json({ id }, 201);
  }

  const match = pathname.match(/^\/api\/profiles\/([0-9a-f-]+)(?:\/(qr-token))?$/i);
  if (match && method === 'POST' && match[2] === 'qr-token') {
    const row = await env.DB.prepare('SELECT id FROM profiles WHERE id=?').bind(match[1]).first();
    if (!row) return json({ error: 'الملف غير موجود.' }, 404);
    const random = crypto.getRandomValues(new Uint8Array(32));
    let binary = '';
    for (const byte of random) binary += String.fromCharCode(byte);
    const token = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const hash = await sha256Hex(token);
    await env.DB.prepare('UPDATE profiles SET public_token_hash=?,updated_at=? WHERE id=?')
      .bind(hash, new Date().toISOString(), match[1]).run();
    return json({ token });
  }

  if (match && method === 'PUT' && !match[2]) {
    const data = await readBody(request);
    const error = validate(data);
    if (error) return json({ error }, 400);
    const now = new Date().toISOString();
    const set = ['active=?', ...editable.map((key) => `${dbColumns[key]}=?`), 'updated_at=?'].join(',');
    const values = [data.active === false ? 0 : 1, ...dbValues(data), now, match[1]];
    const result = await env.DB.prepare(`UPDATE profiles SET ${set} WHERE id=?`).bind(...values).run();
    if (!result.meta.changes) return json({ error: 'الملف غير موجود.' }, 404);
    return json({ id: match[1] });
  }

  if (match && method === 'DELETE' && !match[2]) {
    const result = await env.DB.prepare('DELETE FROM profiles WHERE id=?').bind(match[1]).run();
    return result.meta.changes
      ? json({ ok: true })
      : json({ error: 'الملف غير موجود.' }, 404);
  }

  if (method === 'GET' && pathname.startsWith('/api/public/')) {
    const token = pathname.slice('/api/public/'.length);
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return json({ error: 'غير موجود.' }, 404);
    const hash = await sha256Hex(token);
    const row = await env.DB.prepare('SELECT * FROM profiles WHERE public_token_hash=? AND active=1')
      .bind(hash).first();
    if (!row) return json({ error: 'غير موجود.' }, 404);
    const result = profile(row);
    for (const key of ['id', 'privateNotes', 'createdAt', 'updatedAt', 'active']) delete result[key];
    return json(result);
  }

  return json({ error: 'المسار غير موجود.' }, 404);
}

export async function onRequest({ request, env }) {
  try {
    if (!env.DB) return json({ error: 'قاعدة البيانات غير مربوطة بالموقع.' }, 503);
    return await handle(request, env);
  } catch (error) {
    return json({ error: error.message || 'حدث خطأ بالخادم.' }, 500);
  }
}
