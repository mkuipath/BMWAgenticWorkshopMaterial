import { useState } from 'react';
import type { Material } from '../data/topics';
import { useDownloads } from '../lib/downloads';

const ICON_LABEL: Record<Material['kind'], string> = {
  pdf: 'PDF', mp4: 'MP4', csv: 'CSV', zip: 'ZIP', txt: 'TXT', md: 'MD', html: 'HTML',
};

export function FileRow({ m, first }: { m: Material; first?: boolean }) {
  const { download, preview, canDownload, signIn } = useDownloads();
  const [busy, setBusy] = useState<'down' | 'prev' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (kind: 'down' | 'prev') => {
    setErr(null);
    if (!canDownload) {
      signIn();
      return;
    }
    setBusy(kind);
    try {
      if (kind === 'down') await download(m);
      else await preview(m);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not fetch the file');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`file${first ? ' first' : ''}`}>
      <span className={`ico ${m.kind}`} aria-hidden="true">{ICON_LABEL[m.kind]}</span>
      <div className="meta">
        <b>
          {m.name}
          {m.tag && <span className={`chip ${m.tag === 'Expected output' || m.tag === 'Exception case' ? 'red' : 'teal'}`} style={{ marginLeft: 8 }}>{m.tag}</span>}
        </b>
        <span className="muted" style={{ fontSize: 13 }}>{m.description}</span>
        {m.required === true && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red-text)' }}>Required</span>}
        {m.required === false && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Optional</span>}
        {err && <span role="alert" style={{ fontSize: 12, color: 'var(--red-text)' }}>{err}</span>}
      </div>
      <span className="size">{m.size}</span>
      <div className="acts">
        {m.previewable && (
          <button type="button" className="btn ghost sm" onClick={() => run('prev')} disabled={busy !== null}>
            {busy === 'prev' ? 'Opening…' : m.kind === 'md' || m.kind === 'txt' ? 'Read' : 'Preview'}
          </button>
        )}
        <button type="button" className="btn dark sm" onClick={() => run('down')} disabled={busy !== null} aria-label={`Download ${m.name}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
          {busy === 'down' ? 'Preparing…' : canDownload ? 'Download' : 'Sign in to download'}
        </button>
      </div>
    </div>
  );
}
