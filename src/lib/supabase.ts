import { createClient } from '@supabase/supabase-js';
import { Student } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function profileToStudent(profile: any): Student {
  return {
    id: profile.id,
    name: profile.full_name || 'Student',
    email: profile.college_email || '',
    usn: profile.usn || '',
    branch: profile.branch || 'Engineering',
    admissionYear: Number(profile.admission_year) || 2024,
    currentYear: profile.current_year || '1st Year',
    avatar:
      profile.avatar_url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.usn || profile.id}`,
    role: profile.role === 'admin' ? 'admin' : 'student',
    verified: Boolean(profile.is_verified),
    status: profile.is_suspended ? 'suspended' : 'active',
    phone: profile.phone || '',
    bio: profile.bio || '',
  };
}
