import { Link, NavLink, Outlet } from 'react-router-dom';
import { IconLogOut } from './icons';
import { useAuth } from '../lib/auth';
import { ROLE_LABELS, type StaffRole } from '../lib/types';

const NAV: { to: string; label: string; roles: StaffRole[] }[] = [
  { to: '/app', label: 'Обзор', roles: ['director', 'manager', 'admin'] },
  { to: '/app/leads', label: 'Заявки', roles: ['director', 'manager', 'admin'] },
  { to: '/app/admin', label: 'Настройки', roles: ['admin'] },
];

export function StaffLayout() {
  const { profile, signOut } = useAuth();
  if (!profile) return null;

  const links = NAV.filter(n => n.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">AIKIVAVIORA Office</p>
            <p className="font-medium">{profile.full_name ?? profile.email}</p>
            <p className="text-sm text-slate-600">{ROLE_LABELS[profile.role]}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/app'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/" className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200">
              Чат
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200"
            >
              <IconLogOut className="h-4 w-4" />
              Выход
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
