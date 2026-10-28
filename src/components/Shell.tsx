import type { ReactNode } from 'react';
import { TOPICS, WORKSHOP } from '../data/topics';
import { useUser, firstName } from '../hooks/useUser';

export function navigate(hash: string) {
  window.location.hash = hash;
}

export function topicHash(id: string, section?: string) {
  return section ? `#/topic/${id}/${section}` : `#/topic/${id}`;
}

export function Shell({ current, done, children }: { current: string | null; done: Record<string, boolean>; children: ReactNode }) {
  const { user, signOut } = useUser();

  return (
    <div className="page">
      <header className="top">
        <div className="wrap">
          <button type="button" className="brand" onClick={() => navigate('#/')} aria-label="Go to Home">
            <i aria-hidden="true" />
            BMW × UiPath Workshop
          </button>
          <div className="right">
            <span className="pill">Workshop materials</span>
            {user && (
              <>
                <span className="avatar" aria-hidden="true">{firstName(user.name).charAt(0).toUpperCase()}</span>
                <span className="who">{firstName(user.name)}</span>
                <button type="button" className="linkbtn" onClick={signOut}>Sign out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="strip" aria-label="Topics">
        <div className="wrap">
          <a className={`tab home${current === null ? ' on' : ''}`} href="#/" aria-current={current === null ? 'page' : undefined}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
            Home
          </a>
          {TOPICS.map((t) => (
            <a
              key={t.id}
              className={`tab${current === t.id ? ' on' : ''}${done[t.id] ? ' done' : ''}`}
              href={topicHash(t.id)}
              aria-current={current === t.id ? 'page' : undefined}
            >
              <span className="n" aria-hidden="true">{t.number}</span>
              {t.title}
            </a>
          ))}
        </div>
      </nav>

      {children}

      <footer className="foot">
        <div className="wrap">
          <span>UiPath Professional Services · {WORKSHOP.location} workshop</span>
          <span>Prompts, files and setup steps for the day</span>
        </div>
        <div className="bar" aria-hidden="true" />
      </footer>
    </div>
  );
}
