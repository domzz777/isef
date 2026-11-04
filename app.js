(() => {
  const $ = (id) => document.getElementById(id);
  const fields = ["fullName","age","bloodType","caseType","contactName","contactPhone","contactRelation","language","allergies","conditions","instructions","insuranceName","insurancePhone","insuranceAddress","privateNotes"];
  const palette = ["#0a8f9e","#3f7ae0","#16a37c","#b97f1b","#c8364b","#7a5fd0","#5c7480"];
  let currentId = null;
  let selectedProfile = null;
  let profiles = [];
  let adminAuth = sessionStorage.getItem("medicalQrAdminAuth") || "";

  function encodeCredentials(username, password){
    const bytes = new TextEncoder().encode(username + ":" + password);
    let binary = "";
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  function showLogin(message = ""){
    show("dashboardView");
    $("dashboardContent").classList.add("hidden");
    $("loginPanel").classList.remove("hidden");
    $("loginMessage").textContent = message;
  }

  function hideLogin(){
    $("loginPanel").classList.add("hidden");
    $("dashboardContent").classList.remove("hidden");
  }

  async function api(path, options = {}) {
    let response = await fetch(path, { ...options, headers: { ...(options.body ? {"Content-Type":"application/json"} : {}), ...(adminAuth ? {"Authorization":"Basic " + adminAuth} : {}), ...(options.headers || {}) } });
    if (response.status === 401) {
      adminAuth = "";
      sessionStorage.removeItem("medicalQrAdminAuth");
      showLogin("سجّل الدخول لمتابعة إدارة الملفات.");
      throw new Error("يلزم تسجيل الدخول لإدارة الملفات.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالخادم.");
    return data;
  }

  function readableError(error){
    if (error instanceof TypeError && /fetch/i.test(error.message)) return "الخادم غير متصل. شغّل node server.js من مجلد المشروع، ثم افتح http://localhost:3000 بدل فتح ملف HTML مباشرة.";
    return error.message || "حدث خطأ غير متوقع.";
  }

  function safe(value){ return String(value ?? "").trim(); }
  function escapeHtml(value){ return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function show(view){ ["dashboardView","editorView","detailView"].forEach(id => $(id).classList.toggle("hidden", id !== view)); window.scrollTo({top:0,behavior:"smooth"}); }
  function publicUrl(token){ return new URL("public.html?token=" + encodeURIComponent(token), window.location.href).href; }
  function metaLine(profile){
    return [profile.age ? profile.age + " سنة" : "السن غير محدد", profile.caseType || "عام", profile.bloodType || "فصيلة غير مسجلة"].join(" · ");
  }

  function hasAllergy(p){
    const allergies = safe(p.allergies);
    return Boolean(allergies) && !/لا توجد|لا يوجد|none/i.test(allergies);
  }

  /* ---------- dashboard analytics ---------- */

  function groupCounts(key, fallback){
    const map = new Map();
    profiles.forEach(p => {
      const value = safe(p[key]) || fallback;
      map.set(value, (map.get(value) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  function renderBloodChart(){
    const entries = groupCounts("bloodType", "غير معروف");
    const total = profiles.length;
    const donut = $("bloodDonut");
    const legend = $("bloodLegend");
    $("bloodTotal").textContent = total;
    $("bloodSummary").textContent = total ? entries.length + " فصائل مسجلة" : "لا توجد بيانات بعد";

    if (!total) {
      donut.style.background = "conic-gradient(var(--line) 0 100%)";
      legend.innerHTML = '<div class="chart-empty">ضيف ملفات عشان يظهر توزيع فصائل الدم.</div>';
      return;
    }

    let cursor = 0;
    const stops = entries.map(([label, count], index) => {
      const from = cursor;
      cursor += (count / total) * 100;
      const color = label === "غير معروف" ? "#9fb4bc" : palette[index % palette.length];
      return `${color} ${from.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });
    donut.style.background = `conic-gradient(${stops.join(",")})`;
    legend.innerHTML = entries.map(([label, count], index) => {
      const color = label === "غير معروف" ? "#9fb4bc" : palette[index % palette.length];
      return `<div class="legend-row"><i style="background:${color}"></i><span>${escapeHtml(label)}</span><b>${count}</b></div>`;
    }).join("");
  }

  function renderCasesChart(){
    const entries = groupCounts("caseType", "عام");
    const total = profiles.length;
    $("casesSummary").textContent = total ? entries.length + " نوع حالة" : "لا توجد بيانات بعد";
    if (!total) {
      $("casesChart").innerHTML = '<div class="chart-empty">أنواع الحالات هتظهر هنا بعد إضافة أول ملف.</div>';
      return;
    }
    const top = entries.slice(0, 5);
    const max = top[0][1] || 1;
    $("casesChart").innerHTML = top.map(([label, count]) => `
      <div class="bar-row">
        <span title="${escapeHtml(label)}">${escapeHtml(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="--w:${Math.max(4, Math.round((count / max) * 100))}%"></div></div>
        <b>${count}</b>
      </div>`).join("");
  }

  function renderAgesChart(){
    const buckets = [
      { label: "0–12", min: 0, max: 12 },
      { label: "13–18", min: 13, max: 18 },
      { label: "19–35", min: 19, max: 35 },
      { label: "36–59", min: 36, max: 59 },
      { label: "60+", min: 60, max: 200 }
    ];
    const ages = profiles.map(p => Number(p.age)).filter(age => Number.isFinite(age) && age >= 0);
    const counts = buckets.map(bucket => ages.filter(age => age >= bucket.min && age <= bucket.max).length);
    const max = Math.max(...counts, 1);
    $("agesSummary").textContent = ages.length ? "متوسط السن " + Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) + " سنة" : "لا توجد أعمار مسجلة";
    if (!profiles.length) {
      $("agesChart").innerHTML = '<div class="chart-empty" style="grid-column:1/-1">أعمار الملفات هتظهر هنا.</div>';
      return;
    }
    $("agesChart").innerHTML = buckets.map((bucket, index) => {
      const height = counts[index] ? Math.max(8, Math.round((counts[index] / max) * 100)) : 0;
      return `<div class="age-col"><b>${counts[index]}</b><div class="age-track"><div class="age-fill" style="--h:${height}%"></div></div><span>${bucket.label}</span></div>`;
    }).join("");
  }

  function renderAnalytics(){
    renderBloodChart();
    renderCasesChart();
    renderAgesChart();
  }

  /* ---------- dashboard list ---------- */

  function profileRow(p){
    const initial = escapeHtml((p.fullName || "?").trim().slice(0, 1));
    const chips = [p.caseType || "عام", p.age ? p.age + " سنة" : "", p.bloodType ? "فصيلة " + p.bloodType : ""]
      .filter(Boolean)
      .map(text => `<em class="profile-meta-chip">${escapeHtml(text)}</em>`)
      .join("<i></i>");
    return `
      <article class="profile-row">
        <div class="profile-avatar" aria-hidden="true">${initial}</div>
        <div class="profile-info"><strong>${escapeHtml(p.fullName || "بدون اسم")}</strong><span>${chips}</span></div>
        <span class="status-pill ${p.active ? "" : "off"}">${p.active ? "نشط" : "غير نشط"}</span>
        <div class="profile-row-actions"><button class="button secondary" type="button" data-view="${escapeHtml(p.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>بطاقة الـQR</span></button><button class="button ghost" type="button" data-edit="${escapeHtml(p.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"/></svg><span>تعديل</span></button></div>
      </article>`;
  }

  function renderList(){
    const term = safe($("searchInput").value).toLowerCase();
    const filtered = profiles.filter(p => safe(p.fullName).toLowerCase().includes(term));
    const total = profiles.length;
    const active = profiles.filter(p => p.active).length;
    const emergency = profiles.filter(p => hasAllergy(p) || safe(p.conditions)).length;
    const incomplete = profiles.filter(p => !safe(p.bloodType) || !safe(p.allergies)).length;

    $("profileCount").textContent = total;
    $("profileCountNote").textContent = total === 1 ? "ملف مسجل" : "ملفات مسجلة";
    $("activeCount").textContent = active;
    $("activeNote").textContent = total ? Math.round((active / total) * 100) + "% من الملفات" : "جاهزة للمسح";
    $("emergencyCount").textContent = emergency;
    $("incompleteCount").textContent = incomplete;

    $("profilesList").innerHTML = filtered.map(profileRow).join("");
    $("emptyState").classList.toggle("show", total === 0);
    $("profilesList").style.display = total === 0 ? "none" : "grid";
    if (total && filtered.length === 0) $("profilesList").innerHTML = '<p class="field-note">مفيش نتائج مطابقة للبحث.</p>';

    document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => openDetail(button.dataset.view)));
    document.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => editProfile(button.dataset.edit)));
    renderAnalytics();
  }

  function clearForm(){
    $("profileForm").reset(); $("profileId").value = ""; $("activeProfile").checked = true;
    fields.forEach(id => { if ($(id)) $(id).value = ""; });
    $("formMessage").textContent = "";
  }

  function openEditor(){ currentId = null; clearForm(); $("editorTitle").textContent = "إضافة ملف جديد"; show("editorView"); }

  function editProfile(id){
    const p = profiles.find(x => x.id === id); if (!p) return;
    currentId = id; $("profileId").value = id;
    fields.forEach(k => { if ($(k)) $(k).value = p[k] ?? ""; });
    $("activeProfile").checked = p.active !== false;
    $("editorTitle").textContent = "تعديل ملف: " + p.fullName;
    show("editorView");
  }

  function renderTag(p){
    $("tagName").textContent = p.fullName || "بدون اسم";
    const blood = safe(p.bloodType);
    $("tagBlood").textContent = blood || "—";
    $("tagBlood").style.visibility = blood ? "visible" : "hidden";
  }

  async function openDetail(id){
    selectedProfile = profiles.find(x => x.id === id); if (!selectedProfile) return;
    const p = selectedProfile;
    $("detailName").textContent = p.fullName;
    $("detailMeta").textContent = metaLine(p);
    $("detailStatus").textContent = p.active ? "نشط" : "غير نشط";
    $("detailStatus").classList.toggle("off", !p.active);
    renderTag(p);

    const entries = [
      ["جهة الاتصال", [p.contactName, p.contactRelation].filter(Boolean).join(" · ")],
      ["رقم الطوارئ", p.contactPhone, "ltr"],
      ["فصيلة الدم", p.bloodType],
      ["الحساسية", p.allergies],
      ["الحالات الطبية", p.conditions],
      ["التأمين الصحي", [p.insuranceName, p.insurancePhone].filter(Boolean).join(" · ")]
    ];
    $("detailSummary").innerHTML = entries.map(([label, value, dir]) => `<div class="summary-item"><span>${escapeHtml(label)}</span><strong${dir ? ` class="${dir}"` : ""}>${escapeHtml(value || "غير مسجل")}</strong></div>`).join("");

    $("qrcode").innerHTML = "";
    $("qrUrl").textContent = "جاري توليد رمز الـQR...";
    try {
      const {token} = await api(`/api/profiles/${encodeURIComponent(p.id)}/qr-token`, {method:"POST"});
      const url = publicUrl(token); $("qrUrl").textContent = url;
      if (window.QRCode) new QRCode($("qrcode"), {text:url,width:260,height:260,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
      else $("qrUrl").textContent = "تعذر تحميل مكتبة QR. تأكد من اتصال الإنترنت.";
    } catch (error) { $("qrUrl").textContent = readableError(error); }
    show("detailView");
  }

  /* ---------- form + auth ---------- */

  $("profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const p = {active:$("activeProfile").checked};
    fields.forEach(k => p[k] = safe($(k).value));
    p.age = p.age ? Number(p.age) : null;
    if (!p.fullName || !p.contactPhone){ $("formMessage").textContent = "اكتب الاسم ورقم جهة اتصال الطوارئ."; return; }
    try {
      const result = await api(currentId ? `/api/profiles/${encodeURIComponent(currentId)}` : "/api/profiles", {method:currentId ? "PUT" : "POST", body:JSON.stringify(p)});
      await refreshProfiles(); currentId = result.id; await openDetail(result.id); renderList();
    } catch (error) { $("formMessage").textContent = readableError(error); }
  });

  async function refreshProfiles(){ profiles = await api("/api/profiles"); renderList(); }

  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const username = $("adminUsername").value.trim();
    const password = $("adminPassword").value;
    adminAuth = encodeCredentials(username, password);
    try {
      await refreshProfiles();
      sessionStorage.setItem("medicalQrAdminAuth", adminAuth);
      hideLogin();
      $("loginMessage").textContent = "";
      $("adminPassword").value = "";
    } catch (error) {
      adminAuth = "";
      sessionStorage.removeItem("medicalQrAdminAuth");
      $("loginMessage").textContent = /401|دخول|صحيحة/i.test(error.message) ? "اسم المستخدم أو كلمة المرور غير صحيحة." : readableError(error);
    }
  });

  $("newProfileBtn").addEventListener("click", openEditor);
  $("heroAddBtn").addEventListener("click", openEditor);
  $("emptyCreateBtn").addEventListener("click", openEditor);
  $("backBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("cancelBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("detailBackBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("editProfileBtn").addEventListener("click", () => selectedProfile && editProfile(selectedProfile.id));
  $("openPublicBtn").addEventListener("click", () => selectedProfile && window.open($("qrUrl").textContent, "_blank", "noopener"));
  $("deleteProfileBtn").addEventListener("click", async () => {
    if (!selectedProfile || !confirm("متأكد إنك عايز تحذف الملف؟")) return;
    try { await api(`/api/profiles/${encodeURIComponent(selectedProfile.id)}`, {method:"DELETE"}); selectedProfile = null; await refreshProfiles(); show("dashboardView"); }
    catch(error) { alert(readableError(error)); }
  });
  $("searchInput").addEventListener("input", renderList);

  /* ---------- QR card for the silicone wristband ---------- */

  function getQrImageUrl(){
    const source = $("qrcode").querySelector("canvas") || $("qrcode").querySelector("img");
    if (!source) return "";
    const size = 1200;
    const quietZone = 150;
    const output = document.createElement("canvas");
    output.width = size;
    output.height = size;
    const context = output.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.imageSmoothingEnabled = false;
    context.drawImage(source, quietZone, quietZone, size - quietZone * 2, size - quietZone * 2);
    return output.toDataURL("image/png");
  }

  $("quickDownloadQrBtn").addEventListener("click", () => {
    const imageUrl = getQrImageUrl();
    if (!imageUrl) { alert("QR لسه متولدش. تأكد من اتصال الإنترنت."); return; }
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "medical-qr.png";
    document.body.append(a);
    a.click();
    a.remove();
  });

  $("downloadQrBtn").addEventListener("click", () => {
    const imageUrl = getQrImageUrl();
    if (!imageUrl) { alert("QR لسه متولدش. تأكد من اتصال الإنترنت."); return; }
    const p = selectedProfile || {};
    const name = escapeHtml(p.fullName || "");
    const blood = escapeHtml(p.bloodType || "");
    const printWindow = window.open("", "_blank", "popup,width=560,height=600");
    if (!printWindow) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = "medical-qr.png";
      a.click();
      alert("المتصفح منع نافذة الطباعة، فتم تنزيل صورة QR. اطبعها بمقاس 100%.");
      return;
    }
    printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>بطاقة السوار · ${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
@page{size:55mm 40mm;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:#0d2833;font-family:Cairo,Tahoma,sans-serif}
body{width:55mm;height:40mm;display:grid;place-items:center}
.tag{position:relative;width:45mm;height:30mm;padding:2.2mm 2.4mm;display:flex;flex-direction:column;border:.25mm solid #bcd9dd;border-radius:3mm;background:radial-gradient(35mm 18mm at 100% 0%,#e9fbfb,transparent 70%),#fff}
.tag::after{position:absolute;inset:1mm;content:"";border:.2mm dashed rgba(10,143,158,.4);border-radius:2.2mm}
.brand{position:relative;z-index:1;display:flex;align-items:center;gap:1mm;color:#0a8f9e;font-size:4.4pt;font-weight:700;letter-spacing:.4pt}
.brand b{color:#0d2833}
.brand em{margin-inline-start:auto;padding:0 1mm;border-radius:1mm;background:#e6f7f8;color:#087a87;font-size:3.6pt;font-style:normal}
.cross{display:grid;width:3mm;height:3mm;place-items:center;border-radius:1mm;background:#0a8f9e;color:#fff;font-size:5pt;font-weight:700}
.body{position:relative;z-index:1;flex:1;display:flex;align-items:center;gap:2mm;min-height:0;margin-top:1mm}
.qr{width:19mm;height:19mm;flex:0 0 auto;padding:.6mm;border-radius:1.4mm;background:#fff}
.qr img{display:block;width:100%;height:100%;image-rendering:pixelated}
.info{display:flex;min-width:0;flex-direction:column;gap:.8mm}
.name{max-height:9.5mm;overflow:hidden;font-size:7.2pt;font-weight:900;line-height:1.35}
.blood{align-self:flex-start;padding:.2mm 1.6mm;border:.2mm solid #f0c3ca;border-radius:99px;background:#fdeef1;color:#c8364b;font-size:7pt;font-weight:900}
.hint{color:#5c7480;font-size:4.6pt;line-height:1.4}
</style></head>
<body><div class="tag">
<div class="brand"><span class="cross">+</span><span>MEDICAL <b>QR</b></span><em>ISEF</em></div>
<div class="body"><div class="qr"><img src="${imageUrl}" alt="QR Code"></div>
<div class="info"><div class="name">${name}</div>${blood ? `<span class="blood">${blood}</span>` : ""}<span class="hint">امسح الكود لمعلومات الطوارئ</span></div></div>
</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));window.addEventListener('afterprint',()=>window.close());<\/script></body></html>`);
    printWindow.document.close();
  });

  refreshProfiles().catch(error => {
    if ($("loginPanel").classList.contains("hidden")) showLogin(readableError(error));
  });
})();
