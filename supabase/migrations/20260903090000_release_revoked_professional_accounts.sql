-- Libera e-mails de profissionais que já foram removidos antes desta correção.
-- O convite cria uma identidade em auth.users mesmo antes de ser aceito.
-- Ao revogar, essa identidade precisa ser removida para permitir cadastro independente.
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT member_id
    FROM public.team_members
    WHERE status = 'revoked'
      AND member_id IS NOT NULL
  LOOP
    DELETE FROM auth.users WHERE id = v_user_id;
  END LOOP;

  UPDATE public.team_members
  SET member_id = NULL,
      updated_at = now()
  WHERE status = 'revoked'
    AND member_id IS NOT NULL;
END $$;
