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

async function verifyAdmin() {
  try {
    console.log('🔍 Verifying admin account...\n');

    // List all users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      process.exit(1);
    }

    const adminUser = users?.users?.find(u => u.email === 'sarathpatruni2@gmail.com');

    if (!adminUser) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    console.log('📧 User Details:');
    console.log('   Email:', adminUser.email);
    console.log('   ID:', adminUser.id);
    console.log('   Email confirmed:', adminUser.email_confirmed_at ? '✅' : '❌');
    console.log('   Last sign in:', adminUser.last_sign_in_at);
    console.log('');

    // Check user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id);

    if (roleError) {
      console.error('Error fetching roles:', roleError);
      process.exit(1);
    }

    console.log('👤 User Roles:');
    if (roleData && roleData.length > 0) {
      roleData.forEach(r => console.log(`   - ${r.role}`));
    } else {
      console.log('   None');
    }

    // Try signing in with the provided credentials
    console.log('\n🔐 Testing sign-in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'sarathpatruni2@gmail.com',
      password: 'sarath4249'
    });

    if (signInError) {
      console.error('❌ Sign-in failed:', signInError.message);
      console.log('\n💡 Possible solutions:');
      console.log('   1. Reset the user password');
      console.log('   2. Check email confirmation');
      process.exit(1);
    }

    console.log('✅ Sign-in successful!');
    console.log('   Session token received');

    // Verify admin role after sign-in
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', signInData.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('\n🛡️  Admin role verified:', adminCheck ? '✅ YES' : '❌ NO');

    if (!adminCheck) {
      console.error('\n❌ User does not have admin role!');
      process.exit(1);
    }

    console.log('\n✅ All checks passed! Admin account is ready to use.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
