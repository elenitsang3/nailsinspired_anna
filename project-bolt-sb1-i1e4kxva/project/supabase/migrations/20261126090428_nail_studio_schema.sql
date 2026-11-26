/*
# Nail Art Studio Schema

1. New Tables
- `profiles` — extends auth.users with client info. Columns: id (uuid PK FK auth.users), full_name, phone, instagram_handle, is_approved (bool default false), is_admin (bool default false), created_at.
- `available_slots` — bookable date/time blocks. Columns: id (uuid PK), slot_start (timestamptz), slot_end (timestamptz), is_booked (bool default false), created_at.
- `bookings` — a client booking. Columns: id (uuid PK), user_id (uuid FK auth.users DEFAULT auth.uid()), slot_id (uuid FK available_slots), tier (text), design_notes (text), reference_photo_path (text), created_at.

2. Security
- Enable RLS on profiles, available_slots, bookings.
- profiles: authenticated users can read/update own row. We allow INSERT via a SECURITY DEFINER function so signup can create own profile (otherwise anon can't). Actually signup happens while authenticated (after signUp), so authenticated INSERT on own row works.
- available_slots: authenticated can SELECT unbooked slots; admins can INSERT/DELETE. We use is_admin check.
- bookings: authenticated can SELECT/INSERT own; admins can SELECT all. We use ownership + is_admin check.
- Grants: authenticated gets SELECT/INSERT/UPDATE on profiles (own), SELECT on available_slots, SELECT/INSERT on bookings. Admin operations need is_admin — granted via same authenticated role with policy checks.

3. Storage
- Create private bucket `reference-pics`.
- Policies: authenticated users can upload to a path under their own user id; authenticated can read own; admin can read all. Private bucket requires signed URLs.

4. Important Notes
- is_approved defaults false; is_admin defaults false.
- Owner columns default to auth.uid() so inserts work.
- A trigger creates a profile row on signup OR the app inserts it after signUp.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  instagram_handle text,
  is_approved boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- AVAILABLE_SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.available_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE, UPDATE ON public.available_slots TO authenticated;

DROP POLICY IF EXISTS "slots_select_all" ON public.available_slots;
CREATE POLICY "slots_select_all"
ON public.available_slots FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "slots_admin_insert" ON public.available_slots;
CREATE POLICY "slots_admin_insert"
ON public.available_slots FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "slots_admin_delete" ON public.available_slots;
CREATE POLICY "slots_admin_delete"
ON public.available_slots FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "slots_update_book" ON public.available_slots;
CREATE POLICY "slots_update_book"
ON public.available_slots FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.available_slots(id) ON DELETE CASCADE,
  tier text NOT NULL,
  design_notes text,
  reference_photo_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.bookings TO authenticated;

DROP POLICY IF EXISTS "bookings_select_own_or_admin" ON public.bookings;
CREATE POLICY "bookings_select_own_or_admin"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- INDEX for upcoming appointments lookup
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_start ON public.available_slots(slot_start);

-- STORAGE BUCKET (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-pics', 'reference-pics', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated can manage objects under their own user id prefix; admin can read all
DROP POLICY IF EXISTS "refpics_insert_own" ON storage.objects;
CREATE POLICY "refpics_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reference-pics' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "refpics_read_own" ON storage.objects;
CREATE POLICY "refpics_read_own"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reference-pics' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "refpics_admin_read" ON storage.objects;
CREATE POLICY "refpics_admin_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reference-pics' AND
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);
