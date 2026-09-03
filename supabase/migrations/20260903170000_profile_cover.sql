-- KENDRAH
-- Adiciona foto de capa ao perfil público do prestador.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_cover_url text;

COMMENT ON COLUMN public.profiles.business_cover_url IS
  'Caminho ou URL da foto de capa exibida na página pública de agendamento.';
