-- Atualiza automaticamente agendamentos confirmados após o término.
-- O processamento ocorre no banco, independentemente de o prestador estar com o app aberto.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.auto_complete_appointments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.appointments
  SET status = 'completed'
  WHERE status = 'confirmed'
    AND end_time <= now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_complete_appointments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_complete_appointments() TO postgres, service_role;

-- Executa a cada 5 minutos para que o faturamento seja atualizado pouco
-- depois do término de cada atendimento.
SELECT cron.schedule(
  'kendrah-auto-complete-appointments',
  '*/5 * * * *',
  $$SELECT public.auto_complete_appointments();$$
)
WHERE NOT EXISTS (
  SELECT 1
  FROM cron.job
  WHERE jobname = 'kendrah-auto-complete-appointments'
);
