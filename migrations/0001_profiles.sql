CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  public_token TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  full_name TEXT NOT NULL,
  age INTEGER,
  blood_type TEXT,
  case_type TEXT,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  contact_relation TEXT,
  language TEXT,
  allergies TEXT,
  conditions TEXT,
  instructions TEXT,
  insurance_name TEXT,
  insurance_phone TEXT,
  insurance_address TEXT,
  private_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_public_token ON profiles(public_token);
