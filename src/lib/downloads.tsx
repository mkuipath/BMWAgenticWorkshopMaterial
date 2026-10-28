import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Material } from '../data/topics';
import { downloadMaterial, previewMaterial } from './files';

interface DownloadsApi {
  canDownload: boolean;
  signIn: () => void;
  download: (m: Material) => Promise<void>;
  preview: (m: Material) => Promise<void>;
}

const Ctx = createContext<DownloadsApi | undefined>(undefined);

export function DownloadsProvider({ children }: { children: ReactNode }) {
  const api = useMemo<DownloadsApi>(
    () => ({
      canDownload: true,
      signIn: () => {},
      download: (m) => downloadMaterial(m.path, m.name),
      preview: (m) => previewMaterial(m.path),
    }),
    [],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useDownloads() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDownloads must be used within DownloadsProvider');
  return v;
}
