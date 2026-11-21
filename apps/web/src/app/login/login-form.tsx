'use client';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@apptit/ui/components/button';
import { Input } from '@apptit/ui/components/input';
import { Label } from '@apptit/ui/components/label';
import { Alert } from '@apptit/ui/components/alert';
import { Eye, EyeOff, LogIn } from '@apptit/ui/icons';
import { sessionCommand } from '../../lib/session';

export default function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setVisible(false);
    try {
      await sessionCommand('login', { login, password });
      setPassword('');
      window.location.replace('/workspace');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Connexion indisponible.');
      setPassword('');
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="auth-form" aria-busy={pending}>
      <div className="grid gap-2">
        <Label htmlFor="login">Identifiant</Label>
        <Input
          id="login"
          name="username"
          type="email"
          autoComplete="username"
          required
          maxLength={100}
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          disabled={pending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={12}
            maxLength={256}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            className="pr-14"
            aria-describedby={error ? 'login-error' : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 p-0"
            disabled={pending}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={visible}
            aria-controls="password"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        </div>
      </div>
      {error && (
        <Alert id="login-error" ref={errorRef} tabIndex={-1} variant="destructive" role="alert">
          {error}
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        <LogIn aria-hidden="true" />
        {pending ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
