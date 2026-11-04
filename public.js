(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const I18N = {
    ar: {
      title: "MEDICAL QR · معلومات الطوارئ",
      liveChip: "ملف طوارئ",
      scanChip: "تم فتح الملف من سوار MEDICAL QR",
      publicStatus: "ملف طوارئ نشط · بيانات من صاحب الملف",
      emergencyTitle: "جهة اتصال الطوارئ",
      callNow: "اتصال الآن",
      callAria: "الاتصال بجهة الطوارئ",
      medicalAllergies: "الحساسية",
      medicalConditions: "حالات طبية مهمة",
      medicalInstructions: "تعليمات للطوارئ",
      medicalInsurance: "التأمين الصحي",
      privacyNote: "المعلومات المعروضة مقدمة من صاحب الملف أو المسؤول عنه، ويجب التأكد منها عند الإمكان. التفاصيل الطبية الإضافية غير معروضة في هذه الصفحة.",
      notFoundTitle: "الملف غير متاح",
      notFoundText: "قد يكون الرابط غير صحيح، أو أن الملف غير نشط.",
      notFoundError: "الملف غير موجود، أو أن صفحة الطوارئ غير مفعلة.",
      backToDashboard: "العودة للوحة الإدارة",
      footer: "في حالة الطوارئ الفعلية، اتصل بخدمات الطوارئ المحلية. هذه نسخة تجريبية ولا تُعتمد وحدها.",
      notProvided: "غير مسجل",
      fbAllergies: "لم تُسجل معلومات عن الحساسية",
      fbConditions: "لم تُسجل حالات طبية",
      fbInstructions: "لا توجد تعليمات إضافية",
      fbInsurance: "لم تُسجل بيانات التأمين الصحي",
      metaFallback: "ملف طوارئ",
      langAria: "تغيير اللغة",
      themeDark: "الوضع النهاري",
      themeLight: "الوضع الليلي"
    },
    en: {
      title: "MEDICAL QR · Emergency Info",
      liveChip: "Emergency profile",
      scanChip: "Opened from a MEDICAL QR wristband",
      publicStatus: "Active emergency profile · Data provided by the owner",
      emergencyTitle: "Emergency Contact",
      callNow: "Call Now",
      callAria: "Call the emergency contact",
      medicalAllergies: "Allergies",
      medicalConditions: "Medical Conditions",
      medicalInstructions: "Emergency Instructions",
      medicalInsurance: "Health Insurance",
      privacyNote: "The information shown is provided by the profile owner or their guardian and should be verified where possible. Additional medical details are not displayed on this page.",
      notFoundTitle: "Profile Not Available",
      notFoundText: "The link may be incorrect, or the profile may be inactive.",
      notFoundError: "Profile not found, or the emergency page is not enabled.",
      backToDashboard: "Back to Dashboard",
      footer: "In a real emergency, call your local emergency services. This is a demo and should not be relied on alone.",
      notProvided: "Not provided",
      fbAllergies: "No allergy information recorded",
      fbConditions: "No medical conditions recorded",
      fbInstructions: "No additional instructions",
      fbInsurance: "No insurance information recorded",
      metaFallback: "Emergency profile",
      langAria: "Switch language",
      themeDark: "Light mode",
      themeLight: "Dark mode"
    }
  };

  const CASE_TYPES = {
    "عام": "General",
    "طفل": "Child",
    "أصم": "Deaf",
    "مريض زهايمر": "Alzheimer's patient",
    "مريض سكري": "Diabetic",
    "مريض توحد": "Autistic",
    "طفل معرض للتوهان": "Child at risk of wandering",
    "كبير سن": "Elderly",
    "حساسية شديدة": "Severe allergy",
    "مرض مزمن": "Chronic illness",
    "حالة معرضة لفقدان الوعي": "Risk of losing consciousness",
    "أخرى": "Other"
  };

  const RELATIONS = {
    "الأم": "Mother", "أم": "Mother", "ماما": "Mother",
    "الأب": "Father", "أب": "Father", "بابا": "Father",
    "الأخ": "Brother", "أخ": "Brother",
    "الأخت": "Sister", "أخت": "Sister",
    "الجد": "Grandfather", "جد": "Grandfather",
    "الجدة": "Grandmother", "جدة": "Grandmother",
    "الزوج": "Husband", "زوجي": "Husband",
    "الزوجة": "Wife", "زوجتي": "Wife",
    "الابن": "Son", "الابنة": "Daughter",
    "وصي": "Guardian", "الوصي": "Guardian",
    "قريب": "Relative", "قريبة": "Relative",
    "ممرض": "Nurse", "ممرضة": "Nurse"
  };

  const state = { lang: "ar", profile: null, view: "loading" };
  const t = key => I18N[state.lang][key] ?? I18N.ar[key];
  const trValue = value => {
    const text = String(value || "").trim();
    if (state.lang !== "en" || !text) return text;
    return CASE_TYPES[text] || RELATIONS[text] || text;
  };

  function applyDirection() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "en" ? "ltr" : "rtl";
  }

  function applyStatic() {
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    const langBtn = $("langToggle");
    if (langBtn) {
      $("langLabel").textContent = state.lang === "en" ? "عربي" : "English";
      langBtn.setAttribute("aria-label", t("langAria"));
    }
    window.MEDICAL_QR_THEME_LABELS = { dark: t("themeDark"), light: t("themeLight") };
    const themeBtn = $("themeToggle");
    if (themeBtn) {
      const dark = document.documentElement.dataset.theme === "dark";
      const label = dark ? t("themeDark") : t("themeLight");
      themeBtn.setAttribute("aria-label", label);
      const span = themeBtn.querySelector(".theme-label");
      if (span) span.textContent = label;
    }
    if (state.view === "notFound") {
      const text = $("notFoundText");
      if (text) text.textContent = state.profile ? t("notFoundText") : t("notFoundError");
    }
  }

  const set = (id, value, fallbackKey = "notProvided") => {
    const element = $(id);
    if (element) element.textContent = value || t(fallbackKey);
  };

  function render(p) {
    state.view = "profile";
    $("notFound").classList.add("hidden");
    $("publicProfile").classList.remove("hidden");

    $("publicAvatar").textContent = (p.fullName || "?").trim().slice(0, 1);
    const agePart = p.age ? (state.lang === "en" ? "Age " + p.age : p.age + " سنة") : "";
    set("publicName", p.fullName);
    set("publicMeta", [agePart, trValue(p.caseType), trValue(p.contactRelation)].filter(Boolean).join(" · "), "metaFallback");
    set("publicBlood", p.bloodType || "—", "metaFallback");

    const contact = $("publicContact");
    contact.textContent = "";
    const parts = [p.contactName, trValue(p.contactRelation)].filter(Boolean);
    parts.forEach((part, index) => {
      if (index) contact.append(" · ");
      contact.append(part);
    });
    if (!parts.length) contact.textContent = t("notProvided");
    const phone = String(p.contactPhone || "").trim();
    const digits = phone.replace(/[^\d+]/g, "");
    if (phone) {
      const span = document.createElement("bdi");
      span.dir = "ltr";
      span.textContent = " · " + phone;
      contact.append(span);
      $("callContact").href = "tel:" + digits;
    } else {
      $("callContact").href = "#";
    }
    $("callContact").setAttribute("aria-label", t("callAria"));

    set("publicAllergies", p.allergies, "fbAllergies");
    set("publicConditions", p.conditions, "fbConditions");
    set("publicInstructions", p.instructions, "fbInstructions");
    set("publicInsurance", [p.insuranceName, p.insurancePhone, p.insuranceAddress].filter(Boolean).join(" · "), "fbInsurance");
  }

  function showNotFound(error) {
    state.profile = null;
    state.view = "notFound";
    $("publicProfile").classList.add("hidden");
    $("notFound").classList.remove("hidden");
    $("notFoundText").textContent = error ? t("notFoundError") : t("notFoundText");
  }

  async function load() {
    try {
      if (!token) throw new Error("no token");
      const response = await fetch(`/api/public/${encodeURIComponent(token)}`);
      if (!response.ok) throw new Error("bad response");
      const p = await response.json();
      state.profile = p;
      state.lang = p.language === "en" ? "en" : "ar";
      applyDirection();
      render(p);
      applyStatic();
    } catch {
      showNotFound(true);
    }
  }

  const langBtn = $("langToggle");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      state.lang = state.lang === "en" ? "ar" : "en";
      applyDirection();
      if (state.profile) render(state.profile);
      applyStatic();
    });
  }

  load();
})();
