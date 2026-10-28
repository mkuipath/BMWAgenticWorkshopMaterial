import { useState } from 'react';
import type { ReactNode } from 'react';
import { PLACEHOLDERS, fillPlaceholders } from '../lib/storage';
import type { Values } from '../lib/storage';

const TOKEN_RE = new RegExp(`(${PLACEHOLDERS.map((p) => p.token.replace(/[<>]/g, (c) => '\\' + c)).join('|')})`, 'g');

/** Render text with placeholder tokens highlighted; filled values show in green. */
export function highlight(text: string, values?: Values): ReactNode[] {
  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    const ph = PLACEHOLDERS.find((p) => p.token === part);
    if (!ph) return <span key={i}>{part}</span>;
    const v = values?.[ph.key]?.trim();
    return v ? (
      <span key={i} className="ph filled" title={`From your saved values (${ph.token})`}>{v}</span>
    ) : (
      <span key={i} className="ph">{part}</span>
    );
  });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function useCopy() {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async (text: string) => {
    const ok = await copyText(text);
    setState(ok ? 'ok' : 'fail');
    window.setTimeout(() => setState('idle'), 1800);
  };
  return { state, copy };
}

interface CodeBlockProps {
  text: string;
  values?: Values;
  wrap?: boolean;
  collapsed?: boolean;
  label?: string;
  showCopy?: boolean;
}

export function CodeBlock({ text, values, wrap, collapsed, label = 'Copy', showCopy = true }: CodeBlockProps) {
  const [open, setOpen] = useState(!collapsed);
  const { state, copy } = useCopy();
  const lines = text.split('\n').length;
  const shown = open ? text : text.split('\n').slice(0, 6).join('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="code" style={!open ? { maxHeight: 170, overflow: 'hidden', position: 'relative' } : undefined}>
        {showCopy && (
          <button type="button" className="copy" onClick={() => copy(fillPlaceholders(text, values ?? emptyValues))} aria-live="polite">
            {state === 'ok' ? 'Copied' : state === 'fail' ? 'Select and copy' : label}
          </button>
        )}
        <pre className={wrap ? 'wrap' : undefined}>{highlight(shown, values)}</pre>
        {!open && (
          <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: 'linear-gradient(180deg, rgba(30,30,30,0), #1e1e1e)' }} />
        )}
      </div>
      {collapsed && (
        <button type="button" className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show less' : `Show full prompt · ${lines} lines`}
        </button>
      )}
    </div>
  );
}

const emptyValues: Values = { org: '', tenant: '', clientId: '', entityId: '', folder: '' };
