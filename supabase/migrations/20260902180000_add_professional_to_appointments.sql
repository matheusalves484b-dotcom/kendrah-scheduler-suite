-- Permite identificar qual profissional atende cada agendamento
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS professional_id uuid;

CREATE INDEX IF NOT EXISTS appointments_professional_id_idx
ON public.appointments(professional_id);

-- Agendamentos antigos ficam vinculados ao profissional responsável pela conta.
UPDATE public.appointments
SET professional_id = user_id
WHERE professional_id IS NULL;

-- Mantém o profissional da conta como padrão para novos registros que não informarem o campo.
ALTER TABLE public.appointments
ALTER COLUMN professional_id SET DEFAULT auth.uid();
