-- Permite que administradores consultem os prestadores no painel de embaixadores
-- sem abrir a tabela profiles para usuários comuns.

CREATE OR REPLACE FUNCTION public.admin_list_providers()
RETURNS TABLE (
  id uuid,
  business_name text,
  whatsapp_number text,
  is_ambassador boolean,
  is_admin boolean
)
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
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_admin_id
      AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Acesso administrativo negado';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.business_name,
    p.whatsapp_number,
    COALESCE(p.is_ambassador, false),
    COALESCE(p.is_admin, false)
  FROM public.profiles p
  ORDER BY p.business_name NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_providers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_providers() TO authenticated;
