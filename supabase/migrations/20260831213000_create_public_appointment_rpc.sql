-- Cria o agendamento público de forma atômica.
-- A função valida novamente os dados e o conflito dentro da mesma transação,
-- evitando depender do INSERT direto do papel anon e de políticas RLS frágeis.

CREATE OR REPLACE FUNCTION public.create_public_appointment(
  p_user_id uuid,
  p_service_id uuid,
  p_service_name text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service public.services%ROWTYPE;
  v_appointment_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_service_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_DATA', 'error', 'Serviço ou prestador inválido.');
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

  -- Duração enviada pelo cliente precisa corresponder ao serviço cadastrado.
  IF p_end_time <> p_start_time + (v_service.duration * interval '1 minute') THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TIME', 'error', 'O horário não corresponde à duração do serviço.');
  END IF;

  -- Lock por prestador: impede duas reservas simultâneas no mesmo profissional.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.user_id = p_user_id
      AND a.status IN ('confirmed', 'pending')
      AND a.start_time < p_end_time
      AND a.end_time > p_start_time
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
  END IF;

  INSERT INTO public.appointments (
    service_id, service_name, customer_name, customer_email, customer_phone,
    start_time, end_time, status, notes, user_id
  ) VALUES (
    p_service_id, p_service_name, trim(p_customer_name), lower(trim(p_customer_email)),
    trim(p_customer_phone), p_start_time, p_end_time, 'confirmed',
    NULLIF(trim(p_notes), ''), p_user_id
  )
  RETURNING id INTO v_appointment_id;

  RETURN jsonb_build_object('success', true, 'id', v_appointment_id);
EXCEPTION
  WHEN exclusion_violation THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'code', 'APPOINTMENT_CONFLICT', 'error', 'Este horário acabou de ser ocupado.');
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(uuid, uuid, text, text, text, text, timestamptz, timestamptz, text) TO anon, authenticated;
