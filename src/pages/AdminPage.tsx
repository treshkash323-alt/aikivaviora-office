import { FormEvent, useEffect, useState } from 'react';
import { IconLoader } from '../components/icons';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [companyName, setCompanyName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [kbText, setKbText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('tenants')
      .select('company_name, chat_greeting, kb_text, contact_email, contact_phone, site_url')
      .eq('slug', 'customer-demo')
      .single()
      .then(({ data, error }) => {
        if (data) {
          setCompanyName(data.company_name ?? '');
          setGreeting(data.chat_greeting ?? '');
          setContactEmail(data.contact_email ?? '');
          setContactPhone(data.contact_phone ?? '');
          setSiteUrl(data.site_url ?? '');
          setKbText(data.kb_text ?? '');
        }
        if (error) setMsg(error.message);
        setLoading(false);
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('tenants')
      .update({
        company_name: companyName,
        chat_greeting: greeting,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        site_url: siteUrl,
        kb_text: kbText,
      })
      .eq('slug', 'customer-demo');
    setSaving(false);
    setMsg(error ? error.message : 'Сохранено');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <IconLoader className="h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Настройки заказчика</h1>
      <p className="mt-1 text-sm text-slate-600">
        Заглушки до брифинга. После — подставьте данные реального клиента.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block text-sm">
          Название компании
          <input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Приветствие в чате
          <textarea
            value={greeting}
            onChange={e => setGreeting(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            E-mail компании
            <input
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Телефон
            <input
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Сайт (URL)
          <input
            value={siteUrl}
            onChange={e => setSiteUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          База знаний (текст для AI)
          <textarea
            value={kbText}
            onChange={e => setKbText(e.target.value)}
            rows={12}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </form>
    </div>
  );
}
