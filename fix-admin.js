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

async function fixAdmin() {
  try {
    console.log('🔧 Fixing admin account...\n');

    // Get user
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminUser = users?.users?.find(u => u.email === 'sarathpatruni2@gmail.com');

    if (!adminUser) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    console.log('📧 Email:', adminUser.email);
    console.log('🔧 Applying fixes...\n');

    // Update user to confirm email and set password
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: 'sarath4249',
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      process.exit(1);
    }

    console.log('✅ Email confirmed');
    console.log('✅ Password set');

    // Test sign-in
    console.log('\n🔐 Testing sign-in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'sarathpatruni2@gmail.com',
      password: 'sarath4249'
    });

    if (signInError) {
      console.error('❌ Sign-in still failing:', signInError.message);
      process.exit(1);
    }

    console.log('✅ Sign-in successful!\n');

    console.log('═════════════════════════════════════════════');
    console.log('✅ ADMIN ACCOUNT FIXED AND READY!');
    console.log('═════════════════════════════════════════════\n');
    console.log('📧 Email:    sarathpatruni2@gmail.com');
    console.log('🔐 Password: sarath4249');
    console.log('🔗 Login:    http://localhost:8080/admin/login\n');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdmin();
