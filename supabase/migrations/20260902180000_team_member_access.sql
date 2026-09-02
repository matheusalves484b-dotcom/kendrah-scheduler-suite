-- Permite que uma assinatura do KENDRAH seja usada pelo proprietário + 1 profissional.
-- O profissional recebe acesso por magic link e passa a enxergar a mesma agenda,
-- serviços e disponibilidade do proprietário.

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_email text NOT NULL,
  role text NOT NULL DEFAULT 'professional' CHECK (role = 'professional'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS team_members_one_active_per_owner
  ON public.team_members(owner_id)
  WHERE status IN ('pending', 'active');

CREATE UNIQUE INDEX IF NOT EXISTS team_members_member_unique
  ON public.team_members(member_id)
  WHERE member_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_workspace_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT tm.owner_id
      FROM public.team_members tm
      WHERE tm.member_id = auth.uid()
        AND tm.status = 'active'
      LIMIT 1
    ),
    auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.accept_team_invitation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_owner_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  SELECT owner_id INTO v_owner_id
  FROM public.team_members
  WHERE lower(invited_email) = lower(v_email)
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.team_members
  SET member_id = v_user_id,
      status = 'active',
      updated_at = now()
  WHERE owner_id = v_owner_id
    AND lower(invited_email) = lower(v_email)
    AND status = 'pending';

  RETURN v_owner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_team_member()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_members
  SET status = 'revoked', updated_at = now()
  WHERE owner_id = auth.uid()
    AND status IN ('pending', 'active');
  RETURN FOUND;
END;
$$;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their team member" ON public.team_members;
CREATE POLICY "Owners can manage their team member"
ON public.team_members
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Invited members can view their invitation" ON public.team_members;
CREATE POLICY "Invited members can view their invitation"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  member_id = auth.uid()
  OR lower(invited_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

REVOKE ALL ON FUNCTION public.get_workspace_owner_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_workspace_owner_id() TO authenticated;
REVOKE ALL ON FUNCTION public.accept_team_invitation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation() TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_team_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_team_member() TO authenticated;

-- Permite ao profissional autenticado trabalhar sobre os registros do proprietário.
DROP POLICY IF EXISTS "Authenticated users can manage own services" ON public.services;
CREATE POLICY "Workspace users can manage services"
ON public.services
FOR ALL
TO authenticated
USING (user_id = public.get_workspace_owner_id())
WITH CHECK (user_id = public.get_workspace_owner_id());

DROP POLICY IF EXISTS "Authenticated users can manage own availability" ON public.availability_slots;
CREATE POLICY "Workspace users can manage availability"
ON public.availability_slots
FOR ALL
TO authenticated
USING (user_id = public.get_workspace_owner_id())
WITH CHECK (user_id = public.get_workspace_owner_id());

DROP POLICY IF EXISTS "Providers can view own appointments" ON public.appointments;
CREATE POLICY "Workspace users can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (user_id = public.get_workspace_owner_id());

DROP POLICY IF EXISTS "Providers can update own appointments" ON public.appointments;
CREATE POLICY "Workspace users can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (user_id = public.get_workspace_owner_id())
WITH CHECK (user_id = public.get_workspace_owner_id());

DROP POLICY IF EXISTS "Providers can delete own appointments" ON public.appointments;
CREATE POLICY "Workspace users can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (user_id = public.get_workspace_owner_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
