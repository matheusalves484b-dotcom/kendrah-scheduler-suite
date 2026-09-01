-- Public booking availability helpers.
-- Exposes only occupied time ranges, never customer data.
CREATE OR REPLACE FUNCTION public.get_public_booked_intervals(
  p_user_id uuid,
  p_date date
)
RETURNS TABLE(start_time timestamptz, end_time timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.start_time, a.end_time
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.start_time < (p_date + interval '1 day')
    AND a.end_time > p_date
    AND a.status IN ('pending', 'confirmed')
  ORDER BY a.start_time;
$$;

REVOKE ALL ON FUNCTION public.get_public_booked_intervals(uuid, date) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_booked_intervals(uuid, date) TO anon;

-- Atomic conflict protection: two customers cannot reserve overlapping times.
CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.user_id = NEW.user_id
      AND a.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND a.status IN ('pending', 'confirmed')
      AND NEW.start_time < a.end_time
      AND NEW.end_time > a.start_time
  ) THEN
    RAISE EXCEPTION 'APPOINTMENT_CONFLICT';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_appointment_overlap_trigger ON public.appointments;
CREATE TRIGGER prevent_appointment_overlap_trigger
BEFORE INSERT OR UPDATE OF start_time, end_time, user_id, status
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_appointment_overlap();
