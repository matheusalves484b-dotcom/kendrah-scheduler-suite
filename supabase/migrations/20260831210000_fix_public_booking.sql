-- Corrige o fluxo de agendamento público e garante que dois clientes
-- não consigam ocupar o mesmo horário simultaneamente.

-- 1. A página pública cria o agendamento como "confirmed".
-- A política anterior aceitava apenas "pending", causando erro de RLS
-- no momento de concluir o agendamento.
DROP POLICY IF EXISTS "Visitors can create valid appointments" ON public.appointments;

CREATE POLICY "Visitors can create valid appointments"
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
    SELECT 1 FROM public.services s
    WHERE s.id = appointments.service_id
      AND s.user_id = appointments.user_id
      AND s.name = appointments.service_name
  )
  AND length(trim(customer_name)) BETWEEN 2 AND 100
  AND length(customer_email) BETWEEN 5 AND 255
  AND customer_email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
  AND length(regexp_replace(customer_phone, '\\D', '', 'g')) BETWEEN 8 AND 15
  AND (notes IS NULL OR length(notes) <= 1000)
);

GRANT INSERT ON public.appointments TO anon;

-- 2. Consulta pública somente dos intervalos ocupados.
-- Não retorna nome, telefone ou e-mail do cliente.
CREATE OR REPLACE FUNCTION public.get_public_booked_intervals(
  p_user_id uuid,
  p_date date
)
RETURNS TABLE (
  start_time timestamptz,
  end_time timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.start_time, a.end_time
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.status IN ('confirmed', 'pending')
    AND a.start_time < (p_date + interval '1 day')
    AND a.end_time > p_date;
$$;

REVOKE ALL ON FUNCTION public.get_public_booked_intervals(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booked_intervals(uuid, date) TO anon, authenticated;

-- 3. Impede corrida de dois clientes tentando reservar o mesmo horário.
-- O advisory lock é por prestador e dura somente durante a transação.
CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('confirmed', 'pending') THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

    IF EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.user_id = NEW.user_id
        AND a.status IN ('confirmed', 'pending')
        AND a.id IS DISTINCT FROM NEW.id
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
BEFORE INSERT OR UPDATE OF start_time, end_time, user_id, status
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_appointment_overlap();

REVOKE EXECUTE ON FUNCTION public.prevent_appointment_overlap() FROM anon, authenticated, PUBLIC;
