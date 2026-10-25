(() => {
  const $ = (id) => document.getElementById(id);
  const fields = ["fullName","age","bloodType","caseType","contactName","contactPhone","contactRelation","language","allergies","conditions","instructions","insuranceName","insurancePhone","insuranceAddress","privateNotes"];
  let currentId = null;
  let selectedProfile = null;
  let profiles = [];
  let adminAuth = sessionStorage.getItem("medicalQrAdminAuth") || "";

  async function api(path, options = {}) {
    let response = await fetch(path, { ...options, headers: { ...(options.body ? {"Content-Type":"application/json"} : {}), ...(adminAuth ? {"Authorization":"Basic " + adminAuth} : {}), ...(options.headers || {}) } });
    if (response.status === 401) {
      const username = window.prompt("اسم مستخدم لوحة الإدارة");
      if (username === null) throw new Error("يلزم تسجيل الدخول لإدارة الملفات.");
      const password = window.prompt("كلمة مرور لوحة الإدارة");
      if (password === null) throw new Error("يلزم تسجيل الدخول لإدارة الملفات.");
      adminAuth = btoa(unescape(encodeURIComponent(username + ":" + password)));
      sessionStorage.setItem("medicalQrAdminAuth", adminAuth);
      response = await fetch(path, { ...options, headers: { ...(options.body ? {"Content-Type":"application/json"} : {}), "Authorization":"Basic " + adminAuth, ...(options.headers || {}) } });
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالخادم.");
    return data;
  }
  function safe(value){ return String(value ?? "").trim(); }
  function escapeHtml(value){ return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function show(view){ ["dashboardView","editorView","detailView"].forEach(id => $(id).classList.toggle("hidden", id !== view)); window.scrollTo({top:0,behavior:"smooth"}); }
  function publicUrl(token){ return new URL("public.html?token=" + encodeURIComponent(token), window.location.href).href; }

  function renderList(){
    const term = safe($("searchInput").value).toLowerCase();
    const filtered = profiles.filter(p => safe(p.fullName).toLowerCase().includes(term));
    $("profileCount").textContent = profiles.length;
    $("emergencyCount").textContent = profiles.filter(p => p.active).length;
    $("qrCount").textContent = profiles.length;
    $("profilesList").innerHTML = filtered.map(p => `
      <article class="profile-row">
        <div class="profile-avatar">${escapeHtml((p.fullName || "?").slice(0,1))}</div>
        <div class="profile-info"><strong>${escapeHtml(p.fullName || "بدون اسم")}</strong><span>${escapeHtml(p.caseType || "عام")} · ${p.age ? escapeHtml(p.age) + " سنة" : "السن غير محدد"}</span></div>
        <span class="status-pill ${p.active ? "" : "off"}">${p.active ? "نشط" : "غير نشط"}</span>
        <div class="profile-row-actions"><button class="button secondary" data-view="${escapeHtml(p.id)}">عرض QR</button><button class="button ghost" data-edit="${escapeHtml(p.id)}">تعديل</button></div>
      </article>`).join("");
    $("emptyState").classList.toggle("show", profiles.length === 0);
    $("profilesList").style.display = profiles.length === 0 ? "none" : "grid";
    if (profiles.length && filtered.length === 0) $("profilesList").innerHTML = '<p class="field-note">مفيش نتائج مطابقة للبحث.</p>';
    document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => openDetail(b.dataset.view)));
    document.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editProfile(b.dataset.edit)));
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
  async function openDetail(id){
    selectedProfile = profiles.find(x => x.id === id); if (!selectedProfile) return;
    const p = selectedProfile;
    $("detailName").textContent = p.fullName;
    $("detailMeta").textContent = `${p.age ? p.age + " سنة" : "السن غير محدد"} · ${p.caseType || "عام"}`;
    $("detailStatus").textContent = p.active ? "نشط" : "غير نشط";
    $("detailStatus").classList.toggle("off", !p.active);
    const entries = [["جهة الاتصال", [p.contactName,p.contactPhone].filter(Boolean).join(" · ")],["الحساسية",p.allergies],["الحالات الطبية",p.conditions],["التأمين الصحي",p.insuranceName],["عنوان التأمين",p.insuranceAddress]];
    $("detailSummary").innerHTML = entries.map(([label,value]) => `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "غير مسجل")}</strong></div>`).join("");
    $("qrcode").innerHTML = "";
    try {
      const {token} = await api(`/api/profiles/${encodeURIComponent(p.id)}/qr-token`, {method:"POST"});
      const url = publicUrl(token); $("qrUrl").textContent = url;
      if (window.QRCode) new QRCode($("qrcode"), {text:url,width:150,height:150,colorDark:"#102a43",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
      else $("qrcode").textContent = "تعذر تحميل مكتبة QR. تأكد من اتصال الإنترنت.";
    } catch (error) { $("qrUrl").textContent = error.message; }
    show("detailView");
  }

  $("profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const p = {active:$("activeProfile").checked};
    fields.forEach(k => p[k] = safe($(k).value));
    p.age = p.age ? Number(p.age) : null;
    if (!p.fullName || !p.contactPhone){ $("formMessage").textContent = "اكتب الاسم ورقم جهة اتصال الطوارئ."; return; }
    try {
      const result = await api(currentId ? `/api/profiles/${encodeURIComponent(currentId)}` : "/api/profiles", {method:currentId ? "PUT" : "POST", body:JSON.stringify(p)});
      await refreshProfiles(); currentId = result.id; await openDetail(result.id); renderList();
    } catch (error) { $("formMessage").textContent = error.message; }
  });
  async function refreshProfiles(){ profiles = await api("/api/profiles"); renderList(); }
  $("newProfileBtn").addEventListener("click", openEditor);
  $("emptyCreateBtn").addEventListener("click", openEditor);
  $("backBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("cancelBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("detailBackBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("editProfileBtn").addEventListener("click", () => selectedProfile && editProfile(selectedProfile.id));
  $("openPublicBtn").addEventListener("click", () => selectedProfile && window.open($("qrUrl").textContent, "_blank", "noopener"));
  $("deleteProfileBtn").addEventListener("click", async () => {
    if (!selectedProfile || !confirm("متأكد إنك عايز تحذف الملف؟")) return;
    try { await api(`/api/profiles/${encodeURIComponent(selectedProfile.id)}`, {method:"DELETE"}); selectedProfile = null; await refreshProfiles(); show("dashboardView"); }
    catch(error) { alert(error.message); }
  });
  $("searchInput").addEventListener("input", renderList);
  $("downloadQrBtn").addEventListener("click", () => {
    const img = $("qrcode").querySelector("img"); const canvas = $("qrcode").querySelector("canvas");
    const data = img?.src || canvas?.toDataURL("image/png");
    if (!data) { alert("QR لسه متولدش. تأكد من اتصال الإنترنت."); return; }
    const a = document.createElement("a"); a.href = data; a.download = "medical-qr-profile.png"; a.click();
  });
  refreshProfiles().catch(error => { $("formMessage").textContent = error.message; $("emptyState").classList.add("show"); });
})();
