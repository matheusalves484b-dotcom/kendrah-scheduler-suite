
-- Create a profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  business_name TEXT,
  business_logo_url TEXT,
  whatsapp_number TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow public access to view profiles (for booking pages)
CREATE POLICY "Public can view profiles for booking" 
  ON public.profiles 
  FOR SELECT 
  TO anon
  USING (true);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Users can manage their own services" 
  ON public.services 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Allow public access to view services (for booking pages)
CREATE POLICY "Public can view services for booking" 
  ON public.services 
  FOR SELECT 
  TO anon
  USING (true);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  service_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create appointments" 
  ON public.appointments 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Create availability slots table
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on availability_slots
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for availability_slots
CREATE POLICY "Users can manage their own availability" 
  ON public.availability_slots 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view availability for booking" 
  ON public.availability_slots 
  FOR SELECT 
  TO anon
  USING (true);

-- Create function to generate slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := LOWER(TRIM(REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(base_slug, '-');
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_name TEXT;
  generated_slug TEXT;
BEGIN
  -- Get name from metadata or email
  user_name := COALESCE(new.raw_user_meta_data ->> 'name', SPLIT_PART(new.email, '@', 1));
  
  -- Generate unique slug
  generated_slug := public.generate_slug(user_name);
  
  INSERT INTO public.profiles (id, business_name, slug)
  VALUES (
    new.id, 
    user_name,
    generated_slug
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
