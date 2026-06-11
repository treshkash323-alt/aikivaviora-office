/**
 * Создание трёх staff-пользователей в Supabase Auth.
 *
 * Запуск (service_role только локально, не в git):
 *   set SUPABASE_URL=https://daonsqaxbpzoxslahbge.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
 *   node scripts/create-staff-users.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url?.startsWith('http') || !serviceKey?.startsWith('eyJ')) {
  console.error('Задайте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role)');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const STAFF = [
  {
    email: 'director@customer-placeholder.local',
    password: 'Office_Director_2026!',
    role: 'director',
    full_name: 'Директор (демо)',
  },
  {
    email: 'manager@customer-placeholder.local',
    password: 'Office_Manager_2026!',
    role: 'manager',
    full_name: 'Менеджер (демо)',
  },
  {
    email: 'admin@customer-placeholder.local',
    password: 'Office_Admin_2026!',
    role: 'admin',
    full_name: 'Администратор (демо)',
  },
];

for (const u of STAFF) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { role: u.role, full_name: u.full_name },
  });
  if (error) {
    console.error('FAIL', u.email, error.message);
  } else {
    console.log('OK', u.email, u.role, data.user?.id);
  }
}

console.log('\nПароли (смените после первого входа):');
for (const u of STAFF) {
  console.log(`  ${u.email}  →  ${u.password}`);
}
