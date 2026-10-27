(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const show = (id, value, fallback = "غير مسجل") => { $(id).textContent = value || fallback; };
  async function load(){
    try {
      if (!token) throw new Error("الملف غير موجود أو غير نشط.");
      const response = await fetch(`/api/public/${encodeURIComponent(token)}`);
      if (!response.ok) throw new Error("الملف غير موجود أو غير نشط.");
      const p = await response.json();
      $("notFound").classList.remove("show"); $("publicProfile").classList.remove("hidden");
      show("publicName",p.fullName);
      show("publicMeta",`${p.age ? p.age + " سنة" : "السن غير محدد"} · ${p.bloodType ? "فصيلة الدم: " + p.bloodType : "فصيلة الدم غير مسجلة"}`, "");
      show("publicContact",[p.contactName,p.contactRelation,p.contactPhone].filter(Boolean).join(" · "));
      const phone = String(p.contactPhone || "").replace(/[^\d+]/g,"");
      $("callContact").href = phone ? "tel:" + phone : "#";
      $("callContact").setAttribute("aria-label","الاتصال بجهة الطوارئ");
      show("publicAllergies",p.allergies,"لم تُسجل معلومات عن الحساسية");
      show("publicConditions",p.conditions,"لم تُسجل حالات طبية");
      show("publicInstructions",p.instructions,"لا توجد تعليمات إضافية");
      show("publicInsurance",[p.insuranceName,p.insurancePhone,p.insuranceAddress].filter(Boolean).join(" · "),"لم تُسجل بيانات التأمين الصحي");
    } catch {
      $("notFound").classList.add("show"); $("publicProfile").classList.add("hidden");
      $("notFoundText").textContent = "الملف غير موجود، أو أن صفحة الطوارئ غير مفعلة.";
    }
  }
  load();
})();
