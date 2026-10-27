export const editable = [
  "fullName", "age", "bloodType", "caseType", "contactName", "contactPhone",
  "contactRelation", "language", "allergies", "conditions", "instructions",
  "insuranceName", "insurancePhone", "insuranceAddress", "privateNotes",
];

export const dbColumns = {
  fullName: "full_name", age: "age", bloodType: "blood_type", caseType: "case_type",
  contactName: "contact_name", contactPhone: "contact_phone", contactRelation: "contact_relation",
  language: "language", allergies: "allergies", conditions: "conditions", instructions: "instructions",
  insuranceName: "insurance_name", insurancePhone: "insurance_phone",
  insuranceAddress: "insurance_address", privateNotes: "private_notes",
};

const maxLengths = {
  fullName: 100, contactPhone: 30, bloodType: 10, caseType: 100, contactName: 100,
  contactRelation: 60, language: 10, allergies: 300, conditions: 400, instructions: 400,
  insuranceName: 120, insurancePhone: 30, insuranceAddress: 250, privateNotes: 1000,
};

export function validateProfile(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "صيغة البيانات غير صحيحة.";
  if (typeof data.fullName !== "string" || !data.fullName.trim() || data.fullName.length > maxLengths.fullName) {
    return "الاسم مطلوب وبحد أقصى 100 حرف.";
  }
  if (typeof data.contactPhone !== "string" || !data.contactPhone.trim() || data.contactPhone.length > maxLengths.contactPhone) {
    return "رقم جهة الاتصال مطلوب وبحد أقصى 30 حرفًا.";
  }
  if (data.age !== null && data.age !== "" && data.age !== undefined &&
      (!Number.isInteger(Number(data.age)) || Number(data.age) < 0 || Number(data.age) > 125)) {
    return "السن يجب أن يكون رقمًا بين 0 و125.";
  }
  for (const [key, max] of Object.entries(maxLengths)) {
    if (key !== "fullName" && key !== "contactPhone" && key !== "age" && data[key] != null && String(data[key]).length > max) {
      return `قيمة ${key} أطول من المسموح.`;
    }
  }
  return null;
}

export function fromRow(row) {
  const profile = {
    id: row.id,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  for (const key of editable) profile[key] = row[dbColumns[key]] ?? "";
  return profile;
}

export function publicFromRow(row) {
  return {
    fullName: row.full_name,
    age: row.age ?? "",
    bloodType: row.blood_type ?? "",
    caseType: row.case_type ?? "",
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_phone ?? "",
    contactRelation: row.contact_relation ?? "",
    allergies: row.allergies ?? "",
    conditions: row.conditions ?? "",
    instructions: row.instructions ?? "",
    insuranceName: row.insurance_name ?? "",
    insurancePhone: row.insurance_phone ?? "",
    insuranceAddress: row.insurance_address ?? "",
  };
}

export function insertValues(data) {
  return editable.map((key) => {
    if (key === "age") return data.age === "" || data.age == null ? null : Number(data.age);
    return data[key] ?? "";
  });
}
