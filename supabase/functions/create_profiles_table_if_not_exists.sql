-- Función para crear la tabla de perfiles si no existe
CREATE OR REPLACE FUNCTION create_profiles_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Verificamos si la tabla ya existe
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    -- Creamos la tabla de perfiles
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Configuramos los permisos de la tabla
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir a los usuarios ver su propio perfil
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
    
    -- Política para permitir a los usuarios actualizar su propio perfil
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
    
    -- Política para permitir a los administradores ver todos los perfiles
    CREATE POLICY "Admins can view all profiles" 
      ON public.profiles 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- Política para permitir a los administradores actualizar todos los perfiles
    CREATE POLICY "Admins can update all profiles" 
      ON public.profiles 
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- Creamos un trigger para actualizar el campo updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$ LANGUAGE plpgsql;

