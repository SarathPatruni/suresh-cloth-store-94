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

async function debugRoles() {
  try {
    console.log('🔍 Debugging admin role...\n');

    // Get user
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminUser = users?.users?.find(u => u.email === 'sarathpatruni2@gmail.com');

    console.log('📧 User ID:', adminUser?.id);

    // Check all roles for this user
    const { data: allRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select('*');

    console.log('\n📋 All roles in database:');
    if (allRoles) {
      allRoles.forEach(r => {
        console.log(`   - user_id: ${r.user_id}, role: ${r.role}`);
      });
    }

    // Try to get admin role specifically
    const { data: adminRole, error: adminRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser?.id)
      .eq('role', 'admin');

    console.log('\n🛡️  Admin role query result:', adminRole);
    console.log('   Error:', adminRoleError);

    // If user has the role, make sure it's correct
    if (adminRole && adminRole.length > 0) {
      console.log('\n✅ Admin role EXISTS in database!');
      console.log('   Role entry:', adminRole[0]);

      // Now test with anon key to see if RLS is blocking it
      console.log('\n🔐 Testing with anon client (like the app)...');
      const anonClient = createClient(SUPABASE_URL, 'sb_publishable_oAsrYXWrRl2t70bES8qzTw_3VoG3n4Z');
      
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
          .eq('user_id', adminUser?.id)
          .eq('role', 'admin');

        console.log('   Result:', userRoles);
        console.log('   Error:', userRolesError);

        if (userRolesError) {
          console.log('\n❌ RLS policy is blocking the query!');
        } else if (userRoles && userRoles.length > 0) {
          console.log('\n✅ RLS policy allows the query!');
        }
      }
    } else {
      console.log('\n❌ Admin role NOT found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugRoles();
