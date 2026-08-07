CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM 'cancelled' AND EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.user_id = NEW.user_id
      AND a.id IS DISTINCT FROM NEW.id
      AND COALESCE(a.status, 'confirmed') <> 'cancelled'
      AND a.start_time < NEW.end_time
      AND a.end_time > NEW.start_time
  ) THEN
    RAISE EXCEPTION 'APPOINTMENT_CONFLICT: horario ja ocupado'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_appointment_overlap() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_appointment_overlap ON public.appointments;
CREATE TRIGGER trg_prevent_appointment_overlap
BEFORE INSERT OR UPDATE OF start_time, end_time, status, user_id ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.prevent_appointment_overlap();