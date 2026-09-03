-- Finaliza atendimentos encerrados de forma segura, sem depender de permissao
-- direta de UPDATE na tabela appointments.

CREATE OR REPLACE FUNCTION public.complete_workspace_appointments(p_owner_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer := 0;
  v_is_member boolean := false;
BEGIN
  IF p_owner_id IS NULL THEN
    RETURN 0;
  END IF;

  IF auth.uid() = p_owner_id THEN
    v_is_member := true;
  ELSE
    SELECT EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.owner_id = p_owner_id
        AND tm.member_id = auth.uid()
        AND tm.status = 'active'
    ) INTO v_is_member;
  END IF;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.appointments
  SET status = 'completed'
  WHERE user_id = p_owner_id
    AND status = 'confirmed'
    AND end_time <= now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_workspace_appointments(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_workspace_appointments(uuid) TO authenticated;

-- Corrige imediatamente atendimentos ja encerrados existentes.
UPDATE public.appointments
SET status = 'completed'
WHERE status = 'confirmed'
  AND end_time <= now();

-- Mantem o job anterior como garantia quando o aplicativo estiver fechado.
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
