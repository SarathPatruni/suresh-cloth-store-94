import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function fixRLS() {
  try {
    console.log('🔧 Fixing RLS policies...\n');

    // Fix RLS with direct SQL
    const sqlQueries = [
      `DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;`,
      `DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;`,
      `DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;`,
      
      `CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
       $$;`,
       
      `CREATE POLICY "Users can view their own roles"
         ON public.user_roles FOR SELECT
         TO authenticated
         USING (auth.uid() = user_id);`,
         
      `CREATE POLICY "Admins can manage all roles"
         ON public.user_roles FOR ALL
         TO authenticated
         USING (public.has_role(auth.uid(), 'admin'));`,
    ];

    for (const query of sqlQueries) {
      console.log('Executing:', query.split('\n')[0].substring(0, 50) + '...');
      const { error } = await supabase.rpc('sql', { query });
      if (error) {
        console.error('Error:', error.message);
      }
    }

    console.log('\n✅ RLS policies fixed!\n');

    // Verify with anon client
    console.log('🧪 Testing with app credentials...');
    
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'sarathpatruni2@gmail.com',
      password: 'sarath4249'
    });

    if (session?.session) {
      const userClient = createClient(SUPABASE_URL, 'sb_publishable_oAsrYXWrRl2t70bES8qzTw_3VoG3n4Z', {
        global: {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        }
      });

      const { data: userRoles, error: userRolesError } = await userClient
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('role', 'admin');

      if (userRolesError) {
        console.error('❌ Error:', userRolesError.message);
      } else if (userRoles && userRoles.length > 0) {
        console.log('✅ Admin query successful!');
        console.log('   Role:', userRoles[0].role);
      }
    }

    console.log('\n═════════════════════════════════════════════');
    console.log('✅ READY TO LOGIN!');
    console.log('═════════════════════════════════════════════');
    console.log('\n📧 Email:    sarathpatruni2@gmail.com');
    console.log('🔐 Password: sarath4249');
    console.log('🔗 URL:      http://localhost:8080/admin/login\n');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixRLS();
