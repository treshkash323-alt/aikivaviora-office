import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ROLE_LABELS } from '../lib/types';

type Stats = { total: number; newCount: number; qualified: number; withContact: number };

export default function OverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('leads')
      .select('status, email, phone')
      .then(({ data }) => {
        const rows = data ?? [];
        setStats({
          total: rows.length,
          newCount: rows.filter(r => r.status === 'new').length,
          qualified: rows.filter(r => r.status === 'qualified').length,
          withContact: rows.filter(r => r.email || r.phone).length,
        });
      });
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Обзор</h1>
      <p className="text-sm text-slate-600">
        Вы вошли как {ROLE_LABELS[profile.role]}
      </p>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Всего заявок', stats.total],
            ['Новые', stats.newCount],
            ['С контактом', stats.withContact],
            ['Квалифицированы', stats.qualified],
          ].map(([label, val]) => (
            <div
              key={label as string}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-semibold">{val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Быстрые ссылки</p>
        <ul className="mt-2 space-y-1 text-slate-700">
          <li>
            <Link className="underline" to="/app/leads">
              Заявки из чата
            </Link>
          </li>
          {profile.role === 'admin' && (
            <li>
              <Link className="underline" to="/app/admin">
                Настройки заказчика и KB
              </Link>
            </li>
          )}
          <li>
            <a className="underline" href="/" target="_blank" rel="noreferrer">
              Публичный чат (новая вкладка)
            </a>
          </li>
        </ul>
      </div>

      {profile.role === 'director' && stats && stats.total > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium">Digest (кратко)</p>
          <p className="mt-1">
            За период: {stats.total} диалог(ов) с заявками, {stats.withContact} с
            телефоном или e-mail, {stats.qualified} квалифицировано. AI-digest в
            MVP-2.
          </p>
        </div>
      )}
    </div>
  );
}
