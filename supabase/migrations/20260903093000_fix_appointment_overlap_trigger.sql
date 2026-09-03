-- Corrige triggers duplicados de conflito de horario.
-- Uma migration antiga criou trg_prevent_appointment_overlap e uma posterior
-- criou prevent_appointment_overlap_trigger. Os dois podiam disparar no mesmo UPDATE.

-- Remove ambos os nomes para deixar apenas um trigger ativo.
DROP TRIGGER IF EXISTS trg_prevent_appointment_overlap ON public.appointments;
DROP TRIGGER IF EXISTS prevent_appointment_overlap_trigger ON public.appointments;

-- Mantem a funcao de protecao, mas somente bloqueia conflitos enquanto o
-- novo agendamento ainda esta pendente/confirmado. Ao marcar como completed,
-- nenhuma verificacao de sobreposicao deve ocorrer.
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

CREATE TRIGGER prevent_appointment_overlap_trigger
BEFORE INSERT OR UPDATE OF start_time, end_time, user_id, status
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_appointment_overlap();

REVOKE EXECUTE ON FUNCTION public.prevent_appointment_overlap() FROM anon, authenticated, PUBLIC;

-- Depois de corrigir os triggers, conclui imediatamente os atendimentos que
-- ja terminaram. Essa alteracao de status nao dispara conflito porque o novo
-- status e completed.
UPDATE public.appointments
SET status = 'completed'
WHERE status = 'confirmed'
  AND end_time <= now();

-- Garante que o cron seguro continue ativo como segunda camada de protecao.
SELECT cron.schedule(
  'kendrah-auto-complete-appointments-secure',
  '*/5 * * * *',
  $$SELECT public.auto_complete_appointments();$$
)
WHERE NOT EXISTS (
  SELECT 1
  FROM cron.job
  WHERE jobname = 'kendrah-auto-complete-appointments-secure'
);
