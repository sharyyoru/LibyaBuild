// Run this script to create the first user account
// Usage: node scripts/createFirstUser.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dfxrkgslwnylixyvozdo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createFirstUser() {
  const email = 'wilson@mutant.ae'
  const password = 'wilsontest'
  const fullName = 'Wilson'

  console.log('Creating first user account...')
  console.log('Email:', email)

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError.message)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Get super_admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'super_admin')
      .single()

    if (roleError) {
      console.log('Note: user_roles table may not exist yet. Run SUPABASE_SCHEMA.sql first.')
    }

    // Create user profile in users table
    if (roleData) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          email,
          full_name: fullName,
          role_id: roleData.id,
          locale: 'local',
          is_active: true
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError.message)
      } else {
        console.log('User profile created successfully!')
      }
    }

    console.log('\n✅ First user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('\nYou can now login to the app.')

  } catch (error) {
    console.error('Error:', error.message)
  }
}

createFirstUser()
