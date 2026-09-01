-- Controle administrativo de embaixadores
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin);

-- Função segura para o painel administrativo alterar somente o status de embaixador.
CREATE OR REPLACE FUNCTION public.admin_set_ambassador(
  p_provider_id uuid,
  p_is_ambassador boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Acesso administrativo negado';
  END IF;

  UPDATE public.profiles
  SET is_ambassador = p_is_ambassador,
      updated_at = now()
  WHERE id = p_provider_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prestador não encontrado';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'provider_id', p_provider_id,
    'is_ambassador', p_is_ambassador
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_ambassador(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_ambassador(uuid, boolean) TO authenticated;
