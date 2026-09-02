-- Evita consultar auth.users diretamente em uma policy.
-- O e-mail do usuário autenticado vem do JWT.
DROP POLICY IF EXISTS "Invited members can view their invitation" ON public.team_members;
CREATE POLICY "Invited members can view their invitation"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  member_id = auth.uid()
  OR lower(invited_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);
