-- Different professionals in the same business may attend clients at the same time.
-- Conflicts must therefore be checked per professional, not only per business.

CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_professional_id uuid := COALESCE(NEW.professional_id, NEW.user_id);
BEGIN
  IF NEW.status IN ('confirmed', 'pending') THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(v_professional_id::text, 0));

    IF EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.user_id = NEW.user_id
        AND a.status IN ('confirmed', 'pending')
        AND a.id IS DISTINCT FROM NEW.id
        AND (
          a.professional_id = v_professional_id
          OR (a.professional_id IS NULL AND v_professional_id = NEW.user_id)
        )
        AND a.start_time < NEW.end_time
        AND a.end_time > NEW.start_time
    ) THEN
      RAISE EXCEPTION 'APPOINTMENT_CONFLICT'
        USING ERRCODE = '23P01';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_appointment_overlap_trigger ON public.appointments;
CREATE TRIGGER prevent_appointment_overlap_trigger
BEFORE INSERT OR UPDATE OF start_time, end_time, user_id, status, professional_id
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_appointment_overlap();

REVOKE EXECUTE ON FUNCTION public.prevent_appointment_overlap() FROM anon, authenticated, PUBLIC;
