-- Harden RLS for the KENDRAH multi-tenant data model.
-- Public booking pages must remain able to discover a provider by slug and
-- read the provider's services/availability, while authenticated providers
-- must only be able to manage their own records.

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles for booking" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Booking pages only need public provider identity fields. The existing
-- schema does not have column-level RLS, so keep this policy limited to anon
-- SELECT and rely on the booking UI to request the provider by slug.
CREATE POLICY "Anonymous users can view booking profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- SERVICES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;
DROP POLICY IF EXISTS "Public can view services for booking" ON public.services;

CREATE POLICY "Authenticated users can manage own services"
ON public.services
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view booking services"
ON public.services
FOR SELECT
TO anon
USING (true);

-- AVAILABILITY
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own availability" ON public.availability_slots;
DROP POLICY IF EXISTS "Public can view availability for booking" ON public.availability_slots;

CREATE POLICY "Authenticated users can manage own availability"
ON public.availability_slots
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view booking availability"
ON public.availability_slots
FOR SELECT
TO anon
USING (true);

-- APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visitors can create valid appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

-- Public booking creation: visitors may create only structurally valid,
-- future appointments belonging to the selected service/provider pair.
CREATE POLICY "Public can create valid appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'confirmed'
  AND start_time > now()
  AND end_time > start_time
  AND end_time <= start_time + interval '12 hours'
  AND start_time < now() + interval '1 year'
  AND service_id IS NOT NULL
  AND user_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.services s
    WHERE s.id = appointments.service_id
      AND s.user_id = appointments.user_id
      AND s.name = appointments.service_name
  )
  AND length(trim(customer_name)) BETWEEN 2 AND 100
  AND length(customer_email) BETWEEN 5 AND 255
  AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(regexp_replace(customer_phone, '\D', '', 'g')) BETWEEN 8 AND 15
  AND (notes IS NULL OR length(notes) <= 1000)
);

-- Providers can only read their own appointments.
CREATE POLICY "Providers can view own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Providers can only modify/delete their own appointments, and cannot move
-- an appointment into another provider's account.
CREATE POLICY "Providers can update own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can delete own appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Least privilege for the client roles.
REVOKE ALL ON public.appointments FROM anon;
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;

-- Keep service_role unrestricted for trusted backend operations.
GRANT ALL ON public.appointments TO service_role;
