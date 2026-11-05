'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { sessionCommand } from '../../lib/session';
export default function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    try {
      await sessionCommand('login', { login, password });
      setPassword(''); window.location.replace('/workspace');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Connexion indisponible.'); setPassword(''); setPending(false); }
  }
  return <form onSubmit={submit} className="auth-form" aria-busy={pending}>
    <label htmlFor="login">Identifiant<input id="login" name="username" type="email" autoComplete="username" required maxLength={100} value={login} onChange={event => setLogin(event.target.value)} disabled={pending} /></label>
    <label htmlFor="password">Mot de passe<input id="password" name="password" type="password" autoComplete="current-password" required minLength={12} maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={pending} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
  </form>;
}
