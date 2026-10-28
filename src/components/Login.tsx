import { useState } from 'react';
import type { FormEvent } from 'react';
import { TOPICS, WORKSHOP } from '../data/topics';
import { useUser } from '../hooks/useUser';

export function Login() {
  const { signIn } = useUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const nameOk = name.trim().length > 0;
  const passOk = password.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!nameOk || !passOk) return;
    signIn(name);
  };

  return (
    <div className="login">
      <aside className="login-side">
        <div className="login-side-inner">
          <div className="brand" aria-hidden="true"><i />BMW × UiPath Workshop</div>
          <p className="eyebrow" style={{ color: '#fa7678' }}>{WORKSHOP.eyebrow}</p>
          <h1>{WORKSHOP.title}</h1>
          <p className="lead">{WORKSHOP.lead}</p>
          <ol className="login-topics" aria-label="Topics">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <span className="n">{t.number}</span>
                <span>{t.title}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="bar" aria-hidden="true" />
      </aside>

      <main className="login-main">
        <form className="card login-card" onSubmit={submit} noValidate>
          <div>
            <h2>Sign in to the hub</h2>
            <p className="body" style={{ margin: '6px 0 0' }}>
              Enter your name and the workshop password to open the materials.
            </p>
          </div>

          <div className="field">
            <label htmlFor="login-name">Your name</label>
            <input
              id="login-name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anna Müller"
              aria-invalid={touched && !nameOk ? true : undefined}
            />
            {touched && !nameOk && <span className="field-err" role="alert">Please enter your name.</span>}
          </div>

          <div className="field">
            <label htmlFor="login-pass">Workshop password</label>
            <input
              id="login-pass"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={touched && !passOk ? true : undefined}
            />
            {touched && !passOk && <span className="field-err" role="alert">Please enter the workshop password.</span>}
          </div>

          <button type="submit" className="btn primary" style={{ justifyContent: 'center', minHeight: 44 }}>
            Enter the workshop
          </button>

          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Your name stays on this device and is used to label your progress. {WORKSHOP.facilitator}.
          </p>
        </form>
      </main>
    </div>
  );
}
