DROP POLICY IF EXISTS "Visitors can create valid appointments" ON public.appointments;

CREATE POLICY "Visitors can create valid appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'confirmed'
  AND start_time > now()
  AND end_time > start_time
  AND end_time <= (start_time + '12:00:00'::interval)
  AND start_time < (now() + '1 year'::interval)
  AND service_id IS NOT NULL
  AND user_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM services s
    WHERE s.id = appointments.service_id
      AND s.user_id = appointments.user_id
      AND s.name = appointments.service_name
  )
  AND length(trim(both from customer_name)) BETWEEN 2 AND 100
  AND length(customer_email) BETWEEN 5 AND 255
  AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(regexp_replace(customer_phone, '\D', '', 'g')) BETWEEN 8 AND 15
  AND (notes IS NULL OR length(notes) <= 1000)
);