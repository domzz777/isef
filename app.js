(() => {
  const STORAGE_KEY = "medicalQrPrototypeProfilesV1";
  const $ = (id) => document.getElementById(id);
  const fields = ["fullName","age","bloodType","caseType","contactName","contactPhone","contactRelation","language","allergies","conditions","instructions","insuranceName","insurancePhone","insuranceAddress","privateNotes"];
  let currentId = null;
  let selectedProfile = null;

  function readProfiles(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
  function writeProfiles(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  function safe(value){ return String(value ?? "").trim(); }
  function escapeHtml(value){ return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function newId(){ return (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2)); }
  function show(view){ ["dashboardView","editorView","detailView"].forEach(id => $(id).classList.toggle("hidden", id !== view)); window.scrollTo({top:0,behavior:"smooth"}); }
  function publicUrl(id){ return new URL("public.html?id=" + encodeURIComponent(id), window.location.href).href; }

  function renderList(){
    const profiles = readProfiles();
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
    const p = readProfiles().find(x => x.id === id); if (!p) return;
    currentId = id; $("profileId").value = id;
    fields.forEach(k => { if ($(k)) $(k).value = p[k] ?? ""; });
    $("activeProfile").checked = p.active !== false;
    $("editorTitle").textContent = "تعديل ملف: " + p.fullName;
    show("editorView");
  }
  function openDetail(id){
    selectedProfile = readProfiles().find(x => x.id === id); if (!selectedProfile) return;
    const p = selectedProfile;
    $("detailName").textContent = p.fullName;
    $("detailMeta").textContent = `${p.age ? p.age + " سنة" : "السن غير محدد"} · ${p.caseType || "عام"}`;
    $("detailStatus").textContent = p.active ? "نشط" : "غير نشط";
    $("detailStatus").classList.toggle("off", !p.active);
    const entries = [["جهة الاتصال", [p.contactName,p.contactPhone].filter(Boolean).join(" · ")],["الحساسية",p.allergies],["الحالات الطبية",p.conditions],["التأمين الصحي",p.insuranceName],["عنوان التأمين",p.insuranceAddress]];
    $("detailSummary").innerHTML = entries.map(([label,value]) => `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "غير مسجل")}</strong></div>`).join("");
    $("qrcode").innerHTML = "";
    const url = publicUrl(p.id); $("qrUrl").textContent = url;
    if (window.QRCode) new QRCode($("qrcode"), {text:url,width:150,height:150,colorDark:"#102a43",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
    else $("qrcode").textContent = "تعذر تحميل مكتبة QR. تأكد من اتصال الإنترنت.";
    show("detailView");
  }

  $("profileForm").addEventListener("submit", e => {
    e.preventDefault();
    const profiles = readProfiles();
    const id = currentId || newId();
    const p = {id, active:$("activeProfile").checked, updatedAt:new Date().toISOString()};
    fields.forEach(k => p[k] = safe($(k).value));
    p.age = p.age ? Number(p.age) : "";
    if (!p.fullName || !p.contactPhone){ $("formMessage").textContent = "اكتب الاسم ورقم جهة اتصال الطوارئ."; return; }
    const idx = profiles.findIndex(x => x.id === id);
    if (idx >= 0) profiles[idx] = p; else profiles.unshift(p);
    writeProfiles(profiles); currentId = id; openDetail(id); renderList();
  });
  $("newProfileBtn").addEventListener("click", openEditor);
  $("emptyCreateBtn").addEventListener("click", openEditor);
  $("backBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("cancelBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("detailBackBtn").addEventListener("click", () => { show("dashboardView"); renderList(); });
  $("editProfileBtn").addEventListener("click", () => selectedProfile && editProfile(selectedProfile.id));
  $("openPublicBtn").addEventListener("click", () => selectedProfile && window.open("public.html?id=" + encodeURIComponent(selectedProfile.id), "_blank", "noopener"));
  $("deleteProfileBtn").addEventListener("click", () => {
    if (!selectedProfile || !confirm("متأكد إنك عايز تحذف الملف؟")) return;
    writeProfiles(readProfiles().filter(p => p.id !== selectedProfile.id)); selectedProfile = null; show("dashboardView"); renderList();
  });
  $("searchInput").addEventListener("input", renderList);
  $("downloadQrBtn").addEventListener("click", () => {
    const img = $("qrcode").querySelector("img");
    const canvas = $("qrcode").querySelector("canvas");
    const data = img?.src || canvas?.toDataURL("image/png");
    if (!data) { alert("QR لسه متولدش. تأكد من اتصال الإنترنت."); return; }
    const a = document.createElement("a"); a.href = data; a.download = "medical-qr-" + (selectedProfile?.id || "profile") + ".png"; a.click();
  });

  renderList();
})();