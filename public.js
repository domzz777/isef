(() => {
  const $ = id => document.getElementById(id);
  const KEY = "medicalQrPrototypeProfilesV1";
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  let profiles = [];
  try { profiles = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
  const p = profiles.find(item => item.id === id && item.active !== false);
  const show = (id, value, fallback = "غير مسجل") => { $(id).textContent = value || fallback; };
  if (!p) {
    $("notFound").classList.add("show");
    $("publicProfile").classList.add("hidden");
    $("publicNotice").classList.add("hidden");
    $("notFoundText").textContent = "الملف غير موجود أو غير نشط، أو أن الصفحة اتفتحت على جهاز مختلف عن الجهاز اللي اتسجلت عليه البيانات. النسخة دي بتخزن البيانات محليًا فقط.";
    return;
  }
  $("notFound").classList.remove("show");
  $("publicProfile").classList.remove("hidden");
  show("publicName",p.fullName);
  show("publicMeta",`${p.age ? p.age + " سنة" : "السن غير محدد"} · ${p.bloodType ? "فصيلة الدم: " + p.bloodType : "فصيلة الدم غير مسجلة"}`, "");
  show("publicContact",[p.contactName,p.contactRelation,p.contactPhone].filter(Boolean).join(" · "));
  const phone = String(p.contactPhone || "").replace(/[^\d+]/g,"");
  $("callContact").href = phone ? "tel:" + phone : "#";
  $("callContact").setAttribute("aria-label","الاتصال بجهة الطوارئ");
  show("publicAllergies",p.allergies,"لم تُسجل معلومات عن الحساسية");
  show("publicConditions",p.conditions,"لم تُسجل حالات طبية");
  show("publicInstructions",p.instructions,"لا توجد تعليمات إضافية");
  const insurance = [p.insuranceName,p.insurancePhone,p.insuranceAddress].filter(Boolean).join(" · ");
  show("publicInsurance",insurance,"لم تُسجل بيانات التأمين الصحي");
})();