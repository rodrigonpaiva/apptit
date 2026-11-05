export default function HomePage() {
  return (
    <main>
      <header><a className="brand" href="/" aria-label="Apptit, accueil">apptit<span>.</span></a><span className="badge">Données synthétiques</span></header>
      <section aria-labelledby="welcome"><p className="eyebrow">Espace de démonstration</p><h1 id="welcome">La cuisine commence<br />par de bonnes bases.</h1>
        <p className="intro">L’environnement de développement est prêt à accueillir les premiers parcours de votre équipe.</p>
        <div className="notice"><span aria-hidden="true">01</span><div><h2>Fondation technique</h2><p>Connectez-vous avec votre compte individuel pour ouvrir votre restaurant autorisé. Le catalogue privé arrive à la prochaine étape.</p></div></div>
      <a className="primary-link" href="/login">Se connecter</a></section>
      <footer>Apptit · Environnement local de développement</footer>
    </main>
  );
}
