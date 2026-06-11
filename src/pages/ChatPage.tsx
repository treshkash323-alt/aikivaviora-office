import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconLoader, IconSend } from '../components/icons';
import {
  chatFunctionUrl,
  DEFAULT_TENANT_SLUG,
  supabase,
  supabaseConfigured,
} from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_REPLY =
  'Демо-режим: подключите Supabase — см. docs/SUPABASE_SETUP.md';

const FALLBACK_GREETING =
  'Здравствуйте. Я онлайн-консультант. Помогу подобрать подходящий вариант. Задам несколько уточняющих вопросов.';

function sessionKey(): string {
  const k = 'aikivaviora_session';
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

export default function ChatPage({ tenantSlug = DEFAULT_TENANT_SLUG }: { tenantSlug?: string }) {
  const [company, setCompany] = useState('Компания заказчика');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [boot, setBoot] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mock = !supabaseConfigured || !chatFunctionUrl();

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setBoot('Локальный режим — задайте .env');
      setMessages([
        { id: 'mock-greeting', role: 'assistant', content: FALLBACK_GREETING },
      ]);
      setReady(true);
      return;
    }

    void supabase
      .from('tenants')
      .select('company_name, chat_greeting')
      .eq('slug', tenantSlug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setBoot(error.message);
        if (data?.company_name) setCompany(data.company_name);
        setMessages([
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data?.chat_greeting ?? FALLBACK_GREETING,
          },
        ]);
        setReady(true);
      });
  }, [tenantSlug]);

  const callChat = useCallback(
    async (payload: {
      messages: { role: string; content: string }[];
      userTurn: number;
    }) => {
      if (mock) {
        await new Promise(r => setTimeout(r, 400));
        return MOCK_REPLY;
      }
      const url = chatFunctionUrl()!;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
        },
        body: JSON.stringify({
          tenantSlug,
          sessionKey: sessionKey(),
          ...payload,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        let detail = errText.slice(0, 200);
        try {
          const j = JSON.parse(errText) as { debug?: string };
          if (j.debug) detail = j.debug;
        } catch {
          /* ignore */
        }
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      const data = await res.json();
      return String(data.content ?? '');
    },
    [mock, tenantSlug],
  );

  async function send() {
    const text = input.trim();
    if (!text || loading || !ready) return;
    setInput('');
    const history = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];
    const userTurn = history.filter(m => m.role === 'user').length;
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setLoading(true);
    try {
      const reply = await callChat({ messages: history, userTurn });
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: reply || '…' },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Ошибка связи с сервером (${msg}). Проверьте Edge Function chat.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white shadow-lg">
      <header className="border-b border-slate-200 px-4 py-4">
        <p className="text-xs text-slate-500">AIKIVAVIORA Office · онлайн-консультант</p>
        <h1 className="text-lg font-semibold">{company}</h1>
        {boot && <p className="mt-1 text-xs text-amber-700">{boot}</p>}
        <Link to="/login" className="mt-2 inline-block text-sm text-slate-600 underline">
          Вход для сотрудников
        </Link>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!ready && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <IconLoader className="h-4 w-4" />
            Загрузка…
          </div>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-slate-900 text-white'
                : 'mr-auto bg-slate-100 text-slate-900'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <IconLoader className="h-4 w-4" />
            Печатает…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <footer className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder="Ваш вопрос…"
            disabled={!ready}
            className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !ready || !input.trim()}
            className="rounded-xl bg-slate-900 px-4 text-white disabled:opacity-40"
          >
            <IconSend className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
