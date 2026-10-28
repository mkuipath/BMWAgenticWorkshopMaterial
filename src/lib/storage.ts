import { useCallback, useEffect, useState } from 'react';

export interface Values {
  org: string;
  tenant: string;
  clientId: string;
  entityId: string;
  folder: string;
}

export interface HubState {
  done: Record<string, boolean>;
  checks: Record<string, boolean>;
  values: Values;
}

const KEY = 'bmw-workshop-hub:v1';

const empty: HubState = {
  done: {},
  checks: {},
  values: { org: '', tenant: '', clientId: '', entityId: '', folder: 'Shared' },
};

function read(): HubState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<HubState>;
    return {
      done: parsed.done ?? {},
      checks: parsed.checks ?? {},
      values: { ...empty.values, ...(parsed.values ?? {}) },
    };
  } catch {
    return empty;
  }
}

function write(state: HubState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: state stays in memory for this session */
  }
}

export function useHubState() {
  const [state, setState] = useState<HubState>(() => read());

  useEffect(() => {
    write(state);
  }, [state]);

  const toggleCheck = useCallback((key: string) => {
    setState((s) => ({ ...s, checks: { ...s.checks, [key]: !s.checks[key] } }));
  }, []);

  const setDone = useCallback((topicId: string, done: boolean) => {
    setState((s) => ({ ...s, done: { ...s.done, [topicId]: done } }));
  }, []);

  const setValues = useCallback((values: Values) => {
    setState((s) => ({ ...s, values }));
  }, []);

  return { state, toggleCheck, setDone, setValues };
}

/** Placeholder tokens used in prompts, mapped to the saved value that replaces them. */
export const PLACEHOLDERS: Array<{ token: string; key: keyof Values }> = [
  { token: '<YOUR_ORG_NAME>', key: 'org' },
  { token: '<YOUR_TENANT_NAME>', key: 'tenant' },
  { token: '<YOUR_CLIENT_ID>', key: 'clientId' },
  { token: '<YOUR_ENTITY_ID>', key: 'entityId' },
  { token: '<YOUR_FOLDER>', key: 'folder' },
];

export function fillPlaceholders(text: string, values: Values): string {
  let out = text;
  for (const { token, key } of PLACEHOLDERS) {
    const v = values[key]?.trim();
    if (v) out = out.split(token).join(v);
  }
  return out;
}

export function missingPlaceholders(text: string, values: Values): number {
  let n = 0;
  for (const { token, key } of PLACEHOLDERS) {
    if (text.includes(token) && !values[key]?.trim()) n += 1;
  }
  return n;
}
