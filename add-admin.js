import { createClient } from '@supabase/supabase-js';

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing environment variables!');
  console.error('Required:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (get from Supabase project settings)');
  console.error('\nAdd these to your .env file and try again.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const adminEmail = 'sarathpatruni2@gmail.com';
const adminPassword = 'sarath4249';

async function addAdmin() {
  try {
    // First, try to create the auth user
    let userId = null;
    
    console.log('Checking for existing user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError && authError.status === 422) {
      // User already exists, get their ID
      console.log('User already exists, fetching user ID...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === adminEmail);
      
      if (existingUser) {
        userId = existingUser.id;
        console.log('Found existing user:', userId);
      } else {
        console.error('User exists but could not be found');
        process.exit(1);
      }
    } else if (authError) {
      console.error('Error creating auth user:', authError);
      process.exit(1);
    } else {
      userId = authData.user.id;
      console.log('Auth user created:', userId);
    }

    // Check if admin role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (existingRole) {
      console.log('✅ Admin role already exists!');
    } else {
      // Add admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        })
        .select();

      if (roleError) {
        console.error('Error setting admin role:', roleError);
        process.exit(1);
      }

      console.log('✅ Admin role added successfully!');
    }

    console.log('\n📧 Email:', adminEmail);
    console.log('🔐 Password: sarath4249');
    console.log('\n🔗 Login URL: http://localhost:8080/admin/login');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

addAdmin();
