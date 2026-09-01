-- Corrige a RPC usada pelo painel Administração > Embaixadores.
-- Não depende de updated_at existir em profiles.

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
  v_provider_id uuid;
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = v_admin_id
      AND profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Acesso administrativo negado';
  END IF;

  IF p_provider_id IS NULL THEN
    RAISE EXCEPTION 'Prestador inválido';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = p_provider_id
  ) THEN
    RAISE EXCEPTION 'Prestador não encontrado';
  END IF;

  UPDATE public.profiles
  SET is_ambassador = COALESCE(p_is_ambassador, false)
  WHERE id = p_provider_id
  RETURNING id INTO v_provider_id;

  RETURN jsonb_build_object(
    'success', true,
    'provider_id', v_provider_id,
    'is_ambassador', COALESCE(p_is_ambassador, false)
  );
END;
$$;

REVOKE ALL
ON FUNCTION public.admin_set_ambassador(uuid, boolean)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.admin_set_ambassador(uuid, boolean)
TO authenticated;

-- Solicita ao PostgREST recarregar o schema para reconhecer a RPC atualizada.
NOTIFY pgrst, 'reload schema';
