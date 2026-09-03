-- KENDRAH: horários públicos por profissional
-- Mantém a função existente (date, provider) e adiciona a versão
-- usada pela página pública (provider, date, professional).

CREATE OR REPLACE FUNCTION public.get_public_booked_intervals(
  p_user_id uuid,
  p_date date,
  p_professional_id uuid
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
    AND (
      a.professional_id = p_professional_id
      OR (a.professional_id IS NULL AND p_professional_id = p_user_id)
    )
    AND a.start_time < (p_date + interval '1 day')
    AND a.end_time > p_date;
$$;

REVOKE ALL ON FUNCTION public.get_public_booked_intervals(uuid, date, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booked_intervals(uuid, date, uuid) TO anon, authenticated;
