const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'medical-qr.sqlite');
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 32 * 1024;
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS profiles (
 id TEXT PRIMARY KEY, public_token_hash TEXT UNIQUE, active INTEGER NOT NULL DEFAULT 1,
 full_name TEXT NOT NULL, age INTEGER, blood_type TEXT, case_type TEXT,
 contact_name TEXT, contact_phone TEXT NOT NULL, contact_relation TEXT, language TEXT,
 allergies TEXT, conditions TEXT, instructions TEXT, insurance_name TEXT,
 insurance_phone TEXT, insurance_address TEXT, private_notes TEXT,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(full_name);`);

const columns = ['active','fullName','age','bloodType','caseType','contactName','contactPhone','contactRelation','language','allergies','conditions','instructions','insuranceName','insurancePhone','insuranceAddress','privateNotes'];
const dbColumns = {active:'active',fullName:'full_name',age:'age',bloodType:'blood_type',caseType:'case_type',contactName:'contact_name',contactPhone:'contact_phone',contactRelation:'contact_relation',language:'language',allergies:'allergies',conditions:'conditions',instructions:'instructions',insuranceName:'insurance_name',insurancePhone:'insurance_phone',insuranceAddress:'insurance_address',privateNotes:'private_notes'};
const editable = columns.filter(c => c !== 'active');
function json(res, status, payload) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(JSON.stringify(payload)); }
function authorized(req) {
 const expectedUser=process.env.ADMIN_USER, expectedPassword=process.env.ADMIN_PASSWORD;
 if(!expectedUser || !expectedPassword) return null;
 const match=String(req.headers.authorization || '').match(/^Basic\s+(.+)$/i); if(!match) return false;
 let supplied; try { supplied=Buffer.from(match[1],'base64').toString('utf8'); } catch { return false; }
 const separator=supplied.indexOf(':'); if(separator<0) return false;
 const user=supplied.slice(0,separator), password=supplied.slice(separator+1);
 const same=(a,b) => { const x=Buffer.from(a), y=Buffer.from(b); return x.length===y.length && crypto.timingSafeEqual(x,y); };
 return same(user,expectedUser) && same(password,expectedPassword);
}
function parseBody(req) { return new Promise((resolve,reject) => { let raw=''; req.on('data', chunk => { raw += chunk; if(raw.length > MAX_BODY) { reject(new Error('حجم البيانات أكبر من المسموح.')); req.destroy(); } }); req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('صيغة البيانات غير صحيحة.')); } }); req.on('error', reject); }); }
function profile(row) {
 const out = {id:row.id, active:Boolean(row.active), createdAt:row.created_at, updatedAt:row.updated_at};
 for(const c of editable) out[c] = row[dbColumns[c]] ?? '';
 return out;
}
function valid(data) {
 if(!data || typeof data !== 'object' || Array.isArray(data)) return 'صيغة البيانات غير صحيحة.';
 if(typeof data.fullName !== 'string' || !data.fullName.trim() || data.fullName.length > 100) return 'الاسم مطلوب وبحد أقصى 100 حرف.';
 if(typeof data.contactPhone !== 'string' || !data.contactPhone.trim() || data.contactPhone.length > 30) return 'رقم جهة الاتصال مطلوب وبحد أقصى 30 حرفًا.';
 if(data.age !== null && data.age !== '' && data.age !== undefined && (!Number.isInteger(Number(data.age)) || Number(data.age) < 0 || Number(data.age) > 125)) return 'السن يجب أن يكون رقمًا بين 0 و125.';
 for(const key of editable) if(key !== 'fullName' && key !== 'contactPhone' && key !== 'age' && data[key] != null && String(data[key]).length > ({privateNotes:1000,conditions:400,instructions:400,allergies:300,insuranceAddress:250,insuranceName:120,contactName:100,contactRelation:60,insurancePhone:30,bloodType:10,caseType:100,language:10}[key] || 500)) return `قيمة ${key} أطول من المسموح.`;
 return null;
}
function serveStatic(req,res,url) {
 let pathname = decodeURIComponent(url.pathname);
 if(pathname === '/dashboard.html') pathname = '/index.html';
 if(pathname === '/') pathname = '/index.html';
 const file = path.resolve(ROOT, '.' + pathname);
 if(!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return json(res,404,{error:'الصفحة غير موجودة.'});
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}); fs.createReadStream(file).pipe(res);
}
const server = http.createServer(async (req,res) => {
 const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
 try {
  if(req.method === 'GET' && url.pathname === '/api/health') return json(res,200,{ok:true});
  if(url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/public/') && url.pathname !== '/api/health') {
   const auth=authorized(req);
   if(auth === null) return json(res,503,{error:'إعدادات دخول الإدارة غير مكتملة.'});
   if(!auth) return json(res,401,{error:'بيانات دخول الإدارة مطلوبة.'});
  }
  if(req.method === 'GET' && url.pathname === '/api/profiles') {
   const rows=db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all(); return json(res,200,rows.map(profile));
  }
  if(req.method === 'POST' && url.pathname === '/api/profiles') {
   const data=await parseBody(req), error=valid(data); if(error) return json(res,400,{error});
   const id=crypto.randomUUID(), now=new Date().toISOString();
   const names=['id','active',...editable.map(c=>dbColumns[c]),'created_at','updated_at'];
   const vals=[id,data.active === false ? 0 : 1,...editable.map(c=>c==='age' && data[c] !== '' && data[c] != null ? Number(data[c]) : data[c] ?? ''),now,now];
   db.prepare(`INSERT INTO profiles (${names.join(',')}) VALUES (${names.map(()=>'?').join(',')})`).run(...vals); return json(res,201,{id});
  }
  const match=url.pathname.match(/^\/api\/profiles\/([0-9a-f-]+)(?:\/(qr-token))?$/i);
  if(match && req.method === 'POST' && match[2] === 'qr-token') {
   const row=db.prepare('SELECT id FROM profiles WHERE id=?').get(match[1]); if(!row) return json(res,404,{error:'الملف غير موجود.'});
   const token=crypto.randomBytes(32).toString('base64url'), hash=crypto.createHash('sha256').update(token).digest('hex');
   db.prepare('UPDATE profiles SET public_token_hash=?,updated_at=? WHERE id=?').run(hash,new Date().toISOString(),match[1]); return json(res,200,{token});
  }
  if(match && req.method === 'PUT' && !match[2]) {
   const data=await parseBody(req), error=valid(data); if(error) return json(res,400,{error});
   const now=new Date().toISOString(); const set=['active=?',...editable.map(c=>`${dbColumns[c]}=?`),'updated_at=?'].join(',');
   const vals=[data.active === false ? 0 : 1,...editable.map(c=>c==='age' && data[c] !== '' && data[c] != null ? Number(data[c]) : data[c] ?? ''),now,match[1]];
   const result=db.prepare(`UPDATE profiles SET ${set} WHERE id=?`).run(...vals); if(!result.changes) return json(res,404,{error:'الملف غير موجود.'}); return json(res,200,{id:match[1]});
  }
  if(match && req.method === 'DELETE' && !match[2]) { const result=db.prepare('DELETE FROM profiles WHERE id=?').run(match[1]); return json(res,result.changes?200:404,result.changes?{ok:true}:{error:'الملف غير موجود.'}); }
  if(req.method === 'GET' && url.pathname.startsWith('/api/public/')) {
   const token=url.pathname.slice('/api/public/'.length); if(!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return json(res,404,{error:'غير موجود.'});
   const hash=crypto.createHash('sha256').update(token).digest('hex');
   const row=db.prepare('SELECT * FROM profiles WHERE public_token_hash=? AND active=1').get(hash);
   if(!row) return json(res,404,{error:'غير موجود.'});
   const p=profile(row); for(const key of ['id','privateNotes','createdAt','updatedAt','active']) delete p[key];
   return json(res,200,p);
  }
  if(url.pathname.startsWith('/api/')) return json(res,404,{error:'المسار غير موجود.'});
  if(req.method !== 'GET' && req.method !== 'HEAD') return json(res,405,{error:'الطريقة غير مدعومة.'});
  return serveStatic(req,res,url);
 } catch(err) { if(!res.headersSent) json(res,500,{error:err.message || 'حدث خطأ بالخادم.'}); }
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Medical QR running at http://localhost:${PORT}`));
process.on('SIGINT',()=>{ db.close(); server.close(()=>process.exit(0)); });
