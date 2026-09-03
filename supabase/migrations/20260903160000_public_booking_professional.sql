-- Public booking now supports selecting the professional.
-- The business owner remains the appointment owner (user_id), while
-- professional_id determines whose calendar slot is reserved.

CREATE OR REPLACE FUNCTION public.get_public_booking_professionals(p_user_id uuid)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT p_user_id, COALESCE(NULLIF(u.raw_user_meta_data->>'name', ''), 'Profissional principal')
  FROM auth.users u
  WHERE u.id = p_user_id
  UNION ALL
  SELECT tm.member_id,
         COALESCE(NULLIF(u.raw_user_meta_data->>'name', ''), tm.invited_email, 'Profissional')
  FROM public.team_members tm
  LEFT JOIN auth.users u ON u.id = tm.member_id
  WHERE tm.owner_id = p_user_id
    AND tm.status = 'active'
    AND tm.member_id IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_public_booking_professionals(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booking_professionals(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_booked_intervals(
  p_user_id uuid,
  p_date date,
  p_professional_id uuid DEFAULT NULL
)
RETURNS TABLE (
  start_time timestamptz,
  end_time timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.start_time, a.end_time
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.status IN ('confirmed', 'pending')
    AND (
      p_professional_id IS NULL
      OR a.professional_id = p_professional_id
      OR (a.professional_id IS NULL AND p_professional_id = p_user_id)
    )
    AND a.start_time < (p_date + interval '1 day')
    AND a.end_time > p_date;
$$;

REVOKE ALL ON FUNCTION public.get_public_booked_intervals(uuid, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_booked_intervals(uuid, date, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booked_intervals(uuid, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_booked_intervals(uuid, date, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_public_appointment(
  p_user_id uuid,
  p_service_id uuid,
  p_service_name text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_notes text DEFAULT NULL,
  p_professional_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service public.services%ROWTYPE;
  v_appointment_id uuid;
  v_professional_id uuid := COALESCE(p_professional_id, p_user_id);
BEGIN
  IF p_user_id IS NULL OR p_service_id IS NULL OR v_professional_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_DATA', 'error', 'Serviço, prestador ou profissional inválido.');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = p_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_PROVIDER', 'error', 'Prestador inválido.');
  END IF;

  IF v_professional_id <> p_user_id AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = p_user_id
      AND tm.member_id = v_professional_id
      AND tm.status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_PROFESSIONAL', 'error', 'Profissional não está disponível para agendamento.');
  END IF;

  IF p_start_time <= now() THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TIME', 'error', 'O horário escolhido já passou.');
  END IF;

  IF p_end_time <= p_start_time OR p_end_time > p_start_time + interval '12 hours' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TIME', 'error', 'Intervalo de horário inválido.');
  END IF;

  IF p_start_time >= now() + interval '1 year' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TIME', 'error', 'A data escolhida está fora do período permitido.');
  END IF;

  IF length(trim(coalesce(p_customer_name, ''))) NOT BETWEEN 2 AND 100 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_NAME', 'error', 'Informe um nome válido.');
  END IF;

  IF length(trim(coalesce(p_customer_email, ''))) NOT BETWEEN 5 AND 255
     OR p_customer_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_EMAIL', 'error', 'Informe um e-mail válido.');
  END IF;

  IF length(regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g')) NOT BETWEEN 8 AND 15 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_PHONE', 'error', 'Informe um telefone válido.');
  END IF;

  IF p_notes IS NOT NULL AND length(p_notes) > 1000 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_NOTES', 'error', 'Observações muito longas.');
  END IF;

  SELECT * INTO v_service
  FROM public.services
  WHERE id = p_service_id
    AND user_id = p_user_id
    AND name = p_service_name;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_SERVICE', 'error', 'O serviço selecionado não está disponível.');
  END IF;

  IF p_end_time <> p_start_time + (v_service.duration * interval '1 minute') THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TIME', 'error', 'O horário não corresponde à duração do serviço.');
  END IF;

  -- Lock por profissional, evitando corrida entre clientes do mesmo profissional.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_professional_id::text, 0));

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.user_id = p_user_id
      AND a.status IN ('confirmed', 'pending')
      AND (
        a.professional_id = v_professional_id
        OR (a.professional_id IS NULL AND v_professional_id = p_user_id)
      )
      AND a.start_time < p_end_time
      AND a.end_time > p_start_time
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
  END IF;

  INSERT INTO public.appointments (
    service_id, service_name, customer_name, customer_email, customer_phone,
    start_time, end_time, status, notes, user_id, professional_id
  ) VALUES (
    p_service_id, p_service_name, trim(p_customer_name), lower(trim(p_customer_email)),
    trim(p_customer_phone), p_start_time, p_end_time, 'confirmed',
    NULLIF(trim(p_notes), ''), p_user_id, v_professional_id
  )
  RETURNING id INTO v_appointment_id;

  RETURN jsonb_build_object('success', true, 'id', v_appointment_id, 'professional_id', v_professional_id);
EXCEPTION
  WHEN exclusion_violation THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text, uuid) TO anon, authenticated;
