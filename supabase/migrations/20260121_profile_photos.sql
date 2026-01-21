-- =====================================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- Note: Using external auth system (not Supabase Auth)
-- =====================================================

-- Create storage bucket for profile photos (public bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow all operations on profile-photos bucket (external auth handles security)
CREATE POLICY "Allow all uploads to profile-photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Allow all updates to profile-photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow all deletes from profile-photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow public read from profile-photos"
ON storage.objects FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'profile-photos');

-- =====================================================
-- USER PROFILES TABLE
-- Note: user_id is TEXT to support external numeric IDs
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  profile_photo_path TEXT,
  profile_photo_url TEXT,
  email TEXT,
  email_public BOOLEAN DEFAULT false,
  mobile TEXT,
  mobile_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but with permissive policies (external auth handles security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations (external auth verifies user)
CREATE POLICY "Allow all select on user_profiles"
ON user_profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all insert on user_profiles"
ON user_profiles FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow all update on user_profiles"
ON user_profiles FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all delete on user_profiles"
ON user_profiles FOR DELETE
TO anon, authenticated
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- SCANNED CARDS TABLE
-- =====================================================

-- Create scanned_cards table to store business cards collected by users
-- Note: user_id is TEXT to support external numeric IDs
CREATE TABLE IF NOT EXISTS scanned_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  scanned_user_id TEXT,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  source TEXT CHECK (source IN ('qr', 'ocr')),
  raw_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with permissive policies (external auth handles security)
ALTER TABLE scanned_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on scanned_cards"
ON scanned_cards FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all insert on scanned_cards"
ON scanned_cards FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow all delete on scanned_cards"
ON scanned_cards FOR DELETE
TO anon, authenticated
USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_scanned_cards_user_id ON scanned_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_cards_scanned_user_id ON scanned_cards(scanned_user_id);
