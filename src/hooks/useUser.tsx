import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface WorkshopUser {
  name: string;
  signedInAt: string;
}

interface UserApi {
  user: WorkshopUser | null;
  signIn: (name: string) => void;
  signOut: () => void;
}

const KEY = 'bmw-workshop-hub:user';
const Ctx = createContext<UserApi | undefined>(undefined);

function read(): WorkshopUser | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorkshopUser>;
    return parsed.name ? { name: parsed.name, signedInAt: parsed.signedInAt ?? new Date().toISOString() } : null;
  } catch {
    return null;
  }
}

function write(user: WorkshopUser | null) {
  try {
    if (user) window.localStorage.setItem(KEY, JSON.stringify(user));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the session lives in memory only */
  }
}

/**
 * Workshop sign-in. This is a name prompt, not an access control: any name is
 * accepted, and the name is only used to personalise the hub on this device.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WorkshopUser | null>(() => read());

  const signIn = useCallback((name: string) => {
    const u = { name: name.trim(), signedInAt: new Date().toISOString() };
    write(u);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    write(null);
    setUser(null);
  }, []);

  const api = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUser() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUser must be used within UserProvider');
  return v;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
