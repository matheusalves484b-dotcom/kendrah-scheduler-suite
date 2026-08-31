-- Fix account deletion foreign-key dependencies.
-- auth.users -> profiles already cascades, but child tables previously blocked
-- the profile deletion because their foreign keys did not use ON DELETE CASCADE.

-- Appointments belong to the provider profile and also reference services.
-- Both relationships must cascade so deleting a provider cannot be blocked by
-- existing appointments.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_service_id_fkey
  FOREIGN KEY (service_id)
  REFERENCES public.services(id)
  ON DELETE CASCADE;

-- Availability belongs directly to the provider profile.
ALTER TABLE public.availability_slots
  DROP CONSTRAINT IF EXISTS availability_slots_user_id_fkey;

ALTER TABLE public.availability_slots
  ADD CONSTRAINT availability_slots_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Services already use ON DELETE CASCADE from the original schema, so no
-- change is required there.
