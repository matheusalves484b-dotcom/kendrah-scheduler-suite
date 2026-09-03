-- Preserve the service price used at booking time so historical revenue
-- does not change when the provider edits a service price later.

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS service_price DECIMAL(10,2);

UPDATE public.appointments a
SET service_price = COALESCE(s.price, 0)
FROM public.services s
WHERE s.id = a.service_id
  AND a.service_price IS NULL;

UPDATE public.appointments
SET service_price = 0
WHERE service_price IS NULL;

ALTER TABLE public.appointments
  ALTER COLUMN service_price SET DEFAULT 0,
  ALTER COLUMN service_price SET NOT NULL;

COMMENT ON COLUMN public.appointments.service_price IS
  'Price of the selected service at the time the appointment was created.';
