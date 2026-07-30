-- 1. Harden functions
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := LOWER(TRIM(REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := TRIM(base_slug, '-');
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'user';
  END IF;
  final_slug := base_slug;
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  RETURN final_slug;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.generate_slug(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 2. Restrict anonymous appointment creation
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

CREATE POLICY "Visitors can create valid appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND start_time > now()
  AND end_time > start_time
  AND end_time <= start_time + interval '12 hours'
  AND start_time < now() + interval '1 year'
  AND service_id IS NOT NULL
  AND user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.services s
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

-- 3. Owners can manage their own appointments
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can delete their own appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Owner SELECT policy scoped to authenticated role only
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Least-privilege grants
REVOKE ALL ON public.appointments FROM anon;
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;