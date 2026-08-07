ALTER FUNCTION public.notify_new_appointment() SET search_path = '';
ALTER FUNCTION public.notify_provider_new_appointment() SET search_path = '';

CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
declare
  business_name text;
begin
  if new.status = 'confirmed' then
    select p.business_name into business_name
    from public.profiles p
    where p.id = new.user_id;

    perform net.http_post(
      url := 'https://opqzywvuasgiyubwqtgh.supabase.co/functions/v1/whatsapp-send',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'to', new.customer_phone,
        'templateName', 'confirmacao_agendamento',
        'headerParams', jsonb_build_array(business_name),
        'bodyParams', jsonb_build_array(
          business_name,
          new.customer_name,
          to_char(new.start_time, 'DD/MM/YYYY'),
          to_char(new.start_time, 'HH24:MI')
        )
      )
    );
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.notify_provider_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
declare
  business_name text;
  provider_phone text;
begin
  select p.business_name, p.whatsapp_number
  into business_name, provider_phone
  from public.profiles p
  where p.id = new.user_id;

  if provider_phone is not null then
    perform net.http_post(
      url := 'https://opqzywvuasgiyubwqtgh.supabase.co/functions/v1/whatsapp-send',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'to', provider_phone,
        'templateName', 'novo_agendamento_prestador',
        'headerParams', jsonb_build_array(business_name),
        'bodyParams', jsonb_build_array(
          business_name,
          business_name,
          new.customer_name,
          to_char(new.start_time, 'DD/MM/YYYY'),
          to_char(new.start_time, 'HH24:MI')
        )
      )
    );
  end if;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.notify_new_appointment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_provider_new_appointment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_slug(text) FROM PUBLIC, anon, authenticated;