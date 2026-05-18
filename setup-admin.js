import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function setupAdmin() {
  try {
    console.log('Setting up admin user...\n');

    // First check if user_roles table exists
    console.log('1️⃣ Checking if user_roles table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_roles')
      .select('count', { count: 'exact', head: true });

    if (tableError && tableError.code === 'PGRST116') {
      console.log('❌ Table does not exist. Creating schema...');
      // Table doesn't exist, we need to create it manually via Supabase dashboard
      console.log('\n⚠️  IMPORTANT: Please execute this SQL in your Supabase dashboard:');
      console.log('\nGo to: https://supabase.com/dashboard/project/ywqasypxrknattznrmih/sql/new');
      console.log('\nPaste and run this SQL:\n');
      
      const sql = `
-- Roles enum + table
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies
CREATE POLICY IF NOT EXISTS "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

CREATE POLICY IF NOT EXISTS "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));
      `;
      
      console.log(sql);
      console.log('\n\n2️⃣ After creating the schema, run this script again to add the admin role.');
      process.exit(0);
    } else if (tableError) {
      console.error('Error checking table:', tableError);
      process.exit(1);
    }

    console.log('✅ user_roles table exists\n');

    // Now get the user
    console.log('2️⃣ Getting user by email...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      process.exit(1);
    }

    const adminUser = users?.users?.find(u => u.email === 'sarathpatruni2@gmail.com');

    if (!adminUser) {
      console.error('❌ User not found: sarathpatruni2@gmail.com');
      console.log('Please create this user first in Supabase auth.');
      process.exit(1);
    }

    console.log('✅ Found user:', adminUser.id, `(${adminUser.email})\n`);

    // Check existing role
    console.log('3️⃣ Checking existing admin role...');
    const { data: existing } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (existing) {
      console.log('✅ Admin role already exists!\n');
    } else {
      console.log('Adding admin role...');
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: adminUser.id,
          role: 'admin',
        });

      if (insertError) {
        console.error('❌ Error adding admin role:', insertError);
        process.exit(1);
      }

      console.log('✅ Admin role added!\n');
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ ADMIN SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════\n');
    console.log('📧 Email:    sarathpatruni2@gmail.com');
    console.log('🔐 Password: sarath4249');
    console.log('🔗 Login:    http://localhost:8080/admin/login\n');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

setupAdmin();
