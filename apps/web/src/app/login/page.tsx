import LoginForm from './login-form';
export const dynamic = 'force-dynamic';
export default function LoginPage() {
  return <main className="auth-page"><header><a className="brand" href="/">apptit<span>.</span></a><span className="badge">Données synthétiques</span></header><section className="auth-section"><p className="eyebrow">Votre espace</p><h1>Se connecter</h1><p className="intro">Utilisez votre compte individuel pour accéder à votre restaurant.</p><LoginForm /></section><footer>Apptit · Démonstration avec des comptes individuels synthétiques</footer></main>;
}
