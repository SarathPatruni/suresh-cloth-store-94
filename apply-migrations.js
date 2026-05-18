import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigrations() {
  try {
    console.log('Applying migrations...');

    // Execute the first migration to create user_roles table
    const { data, error } = await supabase.rpc('sql', {
      query: `
        -- Roles enum + table (separate from profiles to prevent privilege escalation)
        CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'user');

        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          role app_role NOT NULL DEFAULT 'user',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (user_id, role)
        );

        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

        -- Security definer function to safely check roles in RLS policies
        CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
        RETURNS BOOLEAN
        LANGUAGE SQL
        STABLE
        SECURITY DEFINER
        SET search_path = public
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = _user_id AND role = _role
          )
        $$;

        CREATE POLICY IF NOT EXISTS "Users can view their own roles"
          ON public.user_roles FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Admins can view all roles"
          ON public.user_roles FOR SELECT
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'));

        CREATE POLICY IF NOT EXISTS "Admins can manage roles"
          ON public.user_roles FOR ALL
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'))
          WITH CHECK (public.has_role(auth.uid(), 'admin'));

        -- Auto-assign 'user' role on signup
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          INSERT INTO public.user_roles (user_id, role)
          VALUES (NEW.id, 'user')
          ON CONFLICT (user_id, role) DO NOTHING;
          RETURN NEW;
        END;
        $$;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    if (error) {
      console.error('Error applying migrations:', error);
      process.exit(1);
    }

    console.log('✅ Migrations applied successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigrations();
