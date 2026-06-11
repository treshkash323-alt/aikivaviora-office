import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { IconLoader } from '../components/icons';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const { profile, signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && profile) {
    return <Navigate to="/app" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Вход для сотрудников</h1>
        <p className="mt-1 text-sm text-slate-600">
          Роли: директор, менеджер, администратор
        </p>
        <label className="mt-4 block text-sm">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="mt-3 block text-sm">
          Пароль
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-white disabled:opacity-50"
        >
          {busy && <IconLoader className="h-4 w-4" />}
          Войти
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-slate-600 underline">
          К чату для клиентов
        </Link>
      </form>
    </div>
  );
}
