-- Acesso gratuito vitalício para prestadores embaixadores.
-- FALSE por padrão para que prestadores comuns continuem sujeitos ao trial/assinatura.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_ambassador boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_ambassador IS
  'Quando true, o prestador possui acesso gratuito vitalício ao sistema, sem assinatura Stripe.';

CREATE INDEX IF NOT EXISTS idx_profiles_is_ambassador
  ON public.profiles (is_ambassador)
  WHERE is_ambassador = true;
