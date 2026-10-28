import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { TOPICS, sectionsOf } from '../data/topics';
import { useDownloads } from '../lib/downloads';
import type { Topic, SectionId } from '../data/topics';
import type { HubState, Values } from '../lib/storage';
import { missingPlaceholders } from '../lib/storage';
import { CodeBlock } from './CodeBlock';
import { FileRow } from './FileRow';
import { topicHash } from './Shell';

interface Props {
  topic: Topic;
  section?: string;
  state: HubState;
  toggleCheck: (key: string) => void;
  setDone: (topicId: string, done: boolean) => void;
  setValues: (v: Values) => void;
}

export function TopicPage({ topic: t, section, state, toggleCheck, setDone, setValues }: Props) {
  const secs = sectionsOf(t);
  const [active, setActive] = useState<SectionId>((section as SectionId) || 'overview');
  const prev = TOPICS.find((x) => x.number === t.number - 1);
  const next = TOPICS.find((x) => x.number === t.number + 1);
  const isDone = !!state.done[t.id];

  // Scroll to the requested section when the route names one.
  useEffect(() => {
    if (section) {
      const el = document.getElementById(`sec-${section}`);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        setActive(section as SectionId);
      }
    } else {
      window.scrollTo({ top: 0 });
      setActive('overview');
    }
  }, [t.id, section]);

  // Track which section is in view for the rail.
  useEffect(() => {
    const els = secs.map((s) => document.getElementById(`sec-${s.id}`)).filter(Boolean) as HTMLElement[];
    if (!('IntersectionObserver' in window) || els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace('sec-', '') as SectionId);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [t.id, secs]);

  const promptsMissing = t.prompts.reduce((n, p) => n + missingPlaceholders(p.text, state.values), 0);
  const prereqDone = t.prerequisites.filter((p) => state.checks[p.key]).length;

  return (
    <>
      <div className="title">
        <div className="wrap">
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flex: '999 1 520px', minWidth: 0 }}>
            <span className={`num${t.number === 5 ? ' last' : ''}${isDone ? ' done' : ''}`} aria-hidden="true">{isDone ? '✓' : t.number}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <p className="eyebrow" style={t.number === 5 ? { color: 'var(--orange-dark)' } : undefined}>
                Topic {t.number} of 5{t.number === 5 ? ' · Last topic' : ''}
              </p>
              <h1>{t.title}</h1>
              <p className="body" style={{ margin: 0, fontSize: 16, maxWidth: '66ch' }}>{t.short}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <span className={`chip${isDone ? ' ok' : ''}`}>{isDone ? 'Completed' : prereqDone > 0 ? 'In progress' : 'Not started'}</span>
                <span className="chip">{secs.length} sections</span>
                <span className="chip">
                  {t.materials.length} {t.materials.length === 1 ? 'file' : 'files'} · {t.prompts.length === 0 ? 'no prompts' : `${t.prompts.length} ${t.prompts.length === 1 ? 'prompt' : 'prompts'}`}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prev ? (
              <a className="btn ghost" href={topicHash(prev.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                {prev.number} · {prev.title}
              </a>
            ) : (
              <span className="btn ghost" aria-disabled="true" style={{ color: '#9d9d9d', borderColor: '#eee' }}>Previous</span>
            )}
            {next ? (
              <a className="btn ghost" href={topicHash(next.id)}>
                {next.number} · {next.title}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            ) : (
              <span className="btn ghost" aria-disabled="true" style={{ color: '#9d9d9d', borderColor: '#eee' }}>Next</span>
            )}
          </div>
        </div>
      </div>

      <main style={{ flex: '1 0 auto' }}>
        <div className="wrap layout" style={{ paddingTop: 28, paddingBottom: 56 }}>
          <aside className="rail" aria-label="Sections">
            <div>
              <p className="t">On this page</p>
              <nav>
                {secs.map((s) => (
                  <a key={s.id} href={topicHash(t.id, s.id)} className={active === s.id ? 'on' : undefined} aria-current={active === s.id ? 'location' : undefined}>
                    {s.label}
                    {s.count && <span className="cnt">{s.count}</span>}
                  </a>
                ))}
              </nav>
            </div>
            {t.noteWhenMissing && (
              <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Not on this topic</span>
                <span className="body" style={{ fontSize: 13 }}>{t.noteWhenMissing}</span>
              </div>
            )}
            <button type="button" className={`btn sm ${isDone ? 'ghost' : 'dark'}`} onClick={() => setDone(t.id, !isDone)}>
              {isDone ? 'Mark as not complete' : 'Mark topic complete'}
            </button>
          </aside>

          <div className="content">
            <section id="sec-overview" className="card sec" aria-labelledby={`h-ov-${t.id}`}>
              <h2 id={`h-ov-${t.id}`}>Overview</h2>
              <p className="body">{t.overview.summary}</p>
              <div className="tiles">
                {t.overview.tiles.map((tile) => (
                  <div key={tile.label} className="tile">
                    <strong>{tile.label}</strong>
                    <span className="body">{tile.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {t.prerequisites.length > 0 && (
              <section id="sec-prerequisites" className="card sec" aria-labelledby={`h-pr-${t.id}`}>
                <h2 id={`h-pr-${t.id}`}>Prerequisites <span className="cnt">{prereqDone} of {t.prerequisites.length}</span></h2>
                <p className="body">Tick each one off as you confirm it. Your ticks are saved in this browser.</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {t.prerequisites.map((p) => (
                    <label key={p.key} className={`check${state.checks[p.key] ? ' done' : ''}`}>
                      <input type="checkbox" checked={!!state.checks[p.key]} onChange={() => toggleCheck(p.key)} />
                      <span><strong>{p.title}</strong> {p.text}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {t.setup && t.setup.length > 0 && (
              <section id="sec-setup" className="card sec" aria-labelledby={`h-su-${t.id}`}>
                <h2 id={`h-su-${t.id}`}>Setup <span className="cnt">{t.setup.length} steps</span></h2>
                {t.setup.map((s, i) => (
                  <div key={s.title} className="step">
                    <span className="no" aria-hidden="true">{i + 1}</span>
                    <div className="in">
                      <h3>{s.title}</h3>
                      {s.intro && <p className="body">{s.intro}</p>}
                      {s.code && <CodeBlock text={s.code} values={state.values} />}
                      {s.valuesForm && <ValuesForm values={state.values} onSave={setValues} />}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {t.materials.length > 0 && (
              <section id="sec-materials" className="card sec" aria-labelledby={`h-ma-${t.id}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <h2 id={`h-ma-${t.id}`}>Materials <span className="cnt">{t.materials.length}</span></h2>
                  {t.downloadAll && <DownloadAll m={t.downloadAll} />}
                </div>
                {t.materialsIntro && <p className="body">{t.materialsIntro}</p>}
                <MaterialList topic={t} />
              </section>
            )}

            {t.prompts.length > 0 && (
              <section id="sec-prompts" className="card sec" aria-labelledby={`h-pp-${t.id}`}>
                <h2 id={`h-pp-${t.id}`}>Prompts <span className="cnt">{t.prompts.length}</span></h2>
                {t.promptsIntro && <p className="body">{t.promptsIntro}</p>}
                {promptsMissing > 0 && (
                  <div className="notice warn" role="status">
                    <span>
                      <strong>{promptsMissing} placeholder{promptsMissing === 1 ? '' : 's'} not filled.</strong> Highlighted values are replaced once you save your values in{' '}
                      {t.setup ? <a href={topicHash(t.id, 'setup')}>Setup</a> : <a href={topicHash('coded-app', 'setup')}>Topic 4 Setup</a>}.
                    </span>
                  </div>
                )}
                {t.prompts.map((p, i) => (
                  <div key={p.id} className={`prompt${i === 0 ? ' first' : ''}`}>
                    <div className="hd">
                      <span className={`chip${p.kind === 'prompt' ? ' teal' : ''}`}>{p.kind === 'prompt' ? `Prompt ${i + 1}` : `Step ${i + 1} · Terminal`}</span>
                      <h3>{p.title}</h3>
                      {p.badge && <span className="chip warn">{p.badge}</span>}
                      {p.kind === 'prompt' && <span className="muted" style={{ fontSize: 13 }}>Paste into your coding agent</span>}
                    </div>
                    {p.intro && <p className="body">{p.intro}</p>}
                    <CodeBlock text={p.text} values={state.values} wrap collapsed={p.collapsed} label={p.kind === 'prompt' ? 'Copy prompt' : 'Copy'} />
                    {p.after && <p className="body">{p.after}</p>}
                  </div>
                ))}
              </section>
            )}

            {t.deploy && (
              <section id="sec-deploy" className="card sec" aria-labelledby={`h-de-${t.id}`}>
                <h2 id={`h-de-${t.id}`}>Deploy manually</h2>
                <p className="body">{t.deploy.intro}</p>
                <CodeBlock text={t.deploy.code} values={state.values} />
              </section>
            )}

            <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="body">{isDone ? 'Topic marked complete.' : 'Done with this topic?'}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn ghost sm" onClick={() => setDone(t.id, !isDone)}>
                  {isDone ? 'Mark as not complete' : 'Mark topic complete'}
                </button>
                {next ? (
                  <a className="btn dark sm" href={topicHash(next.id)}>Next: {next.number} · {next.title}</a>
                ) : (
                  <a className="btn dark sm" href="#/">Back to Home</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MaterialList({ topic }: { topic: Topic }) {
  const groups: Array<{ name?: string; items: Topic['materials'] }> = [];
  for (const m of topic.materials) {
    const g = groups.find((x) => x.name === m.group);
    if (g) g.items.push(m);
    else groups.push({ name: m.group, items: [m] });
  }
  return (
    <>
      {groups.map((g, gi) => (
        <div key={g.name ?? gi} style={{ display: 'flex', flexDirection: 'column' }}>
          {g.name && <p className="grp">{g.name}</p>}
          {g.items.map((m, i) => <FileRow key={m.path} m={m} first={i === 0 && !g.name && gi === 0} />)}
        </div>
      ))}
    </>
  );
}

function DownloadAll({ m }: { m: NonNullable<Topic['downloadAll']> }) {
  const api = useDownloads();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const click = async () => {
    setErr(null);
    if (!api.canDownload) { api.signIn(); return; }
    setBusy(true);
    try { await api.download(m); } catch (e) { setErr(e instanceof Error ? e.message : 'Download failed'); } finally { setBusy(false); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button type="button" className="btn primary sm" onClick={click} disabled={busy} title={m.description}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
        {busy ? 'Preparing…' : `Download all · ${m.size}`}
      </button>
      {err && <span role="alert" style={{ fontSize: 12, color: 'var(--red-text)' }}>{err}</span>}
    </div>
  );
}

function ValuesForm({ values, onSave }: { values: Values; onSave: (v: Values) => void }) {
  const [draft, setDraft] = useState<Values>(values);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(values), [values]);
  const set = (k: keyof Values) => (e: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="vals">
        <div className="field"><label htmlFor="v-org">Organisation name</label><input id="v-org" value={draft.org} onChange={set('org')} placeholder="YOUR_ORG_NAME" autoComplete="off" /></div>
        <div className="field"><label htmlFor="v-tenant">Tenant name</label><input id="v-tenant" value={draft.tenant} onChange={set('tenant')} placeholder="YOUR_TENANT_NAME" autoComplete="off" /></div>
        <div className="field"><label htmlFor="v-client">Client ID</label><input id="v-client" value={draft.clientId} onChange={set('clientId')} placeholder="YOUR_CLIENT_ID" autoComplete="off" /></div>
        <div className="field"><label htmlFor="v-entity">Tickets entity ID</label><input id="v-entity" value={draft.entityId} onChange={set('entityId')} placeholder="YOUR_ENTITY_ID" autoComplete="off" /></div>
        <div className="field"><label htmlFor="v-folder">Deploy folder</label><input id="v-folder" value={draft.folder} onChange={set('folder')} placeholder="Shared" autoComplete="off" /></div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="btn primary sm">{saved ? 'Saved' : 'Save values'}</button>
        <span className="muted" style={{ fontSize: 12 }}>Stored in this browser only. Nothing is sent to the facilitators.</span>
      </div>
    </form>
  );
}
