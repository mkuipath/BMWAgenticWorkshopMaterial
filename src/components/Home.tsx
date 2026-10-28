import { TOPICS, WORKSHOP, sectionsOf } from '../data/topics';
import { topicHash } from './Shell';
import { useUser, firstName } from '../hooks/useUser';

export function Home({ done }: { done: Record<string, boolean> }) {
  const { user } = useUser();
  const doneCount = TOPICS.filter((t) => done[t.id]).length;
  const next = TOPICS.find((t) => !done[t.id]);

  return (
    <>
      <section className="hero top">
        <div className="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: '999 1 520px', minWidth: 0 }}>
            <p className="eyebrow" style={{ color: '#fa7678' }}>{WORKSHOP.eyebrow}</p>
            <h1>{WORKSHOP.title}</h1>
            <p className="lead">{WORKSHOP.lead}</p>
            <div className="meta">
              <span>{WORKSHOP.date}</span>
              <span>{WORKSHOP.location}</span>
              <span>5 topics · 1 day</span>
            </div>
          </div>
          <aside className="prog" aria-label="Your progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong>{user ? `${firstName(user.name)}'s progress` : 'Your progress'}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{doneCount} of 5 topics</span>
            </div>
            <div className="segs" aria-hidden="true">
              {TOPICS.map((t) => <span key={t.id} className={done[t.id] ? 'done' : undefined} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span className="body">{next ? 'Next up' : 'All done'}</span>
              {next ? (
                <a href={topicHash(next.id)} style={{ fontWeight: 600 }}>{next.number} · {next.title}</a>
              ) : (
                <span style={{ fontWeight: 600 }}>Thank you for taking part</span>
              )}
            </div>
          </aside>
        </div>
      </section>

      <main style={{ flex: '1 0 auto' }}>
        <div className="wrap" style={{ paddingTop: 36, paddingBottom: 56, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Topics</h2>
            <span className="muted">Each topic builds on the one before it.</span>
          </div>

          <div className="topics">
            {TOPICS.map((t) => {
              const secs = sectionsOf(t);
              const isDone = !!done[t.id];
              return (
                <article key={t.id} className="card topic">
                  <div className="hd">
                    <span className={`num${t.number === 5 ? ' last' : ''}${isDone ? ' done' : ''}`} aria-hidden="true">{isDone ? '✓' : t.number}</span>
                    <div>
                      <h2>{t.title}</h2>
                      <p className="sc">{t.scenario}</p>
                    </div>
                  </div>
                  <p className="desc">{t.short}</p>
                  <div className="inside">
                    <span className="t">Inside</span>
                    <div className="chips">
                      {secs.map((s) => (
                        <a key={s.id} href={topicHash(t.id, s.id)} className={`chip${s.id === 'materials' || s.id === 'prompts' ? ' teal' : ''}`} style={{ textDecoration: 'none' }}>
                          {s.label}{s.count && !s.count.includes('steps') ? ` · ${s.count}` : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="ft">
                    <span className={`chip${isDone ? ' ok' : ''}`}>{isDone ? 'Completed' : 'Not started'}</span>
                    <a className="btn primary sm" href={topicHash(t.id)}>Open topic</a>
                  </div>
                </article>
              );
            })}

            <aside className="card help" aria-label="Help">
              <div style={{ flex: '999 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Stuck on something?</h2>
                <p className="body" style={{ margin: 0 }}>
                  Raise your hand or message the facilitators. Common CLI and login fixes are under each topic's Prerequisites.
                </p>
              </div>
              <span className="chip">{WORKSHOP.facilitator}</span>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
