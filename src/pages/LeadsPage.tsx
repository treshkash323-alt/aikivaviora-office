import { useCallback, useEffect, useState } from 'react';
import { IconLoader } from '../components/icons';
import { supabase } from '../lib/supabase';
import type { Lead } from '../lib/types';

const STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  contacted: 'В работе',
  qualified: 'Квалифицирована',
  won: 'Успех',
  lost: 'Отказ',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else {
          setError(null);
          setLeads((data as Lead[]) ?? []);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <IconLoader className="h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Заявки</h1>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Обновить
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Создаются автоматически из диалогов в чате (пакет, контакт или 3+ сообщения).
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {leads.length === 0 ? (
        <p className="mt-4 text-slate-600">Пока пусто. Пройдите сценарий в публичном чате.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {leads.map(l => (
            <li key={l.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                  {STATUS_LABEL[l.status] ?? l.status}
                </span>
                <span className="text-xs text-slate-500">{fmtDate(l.created_at)}</span>
              </div>
              {l.recommended && (
                <p className="mt-2 font-medium">Пакет: {l.recommended}</p>
              )}
              {l.need_summary && (
                <p className="mt-1 text-slate-700">{l.need_summary}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-slate-600">
                {l.phone && <span>📞 {l.phone}</span>}
                {l.email && <span>✉ {l.email}</span>}
                {l.budget_range && <span>Бюджет: {l.budget_range}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
