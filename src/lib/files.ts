/**
 * Workshop files ship as static assets beside the page (public/files/...),
 * so a download is a plain same-origin link. No sign-in or API is involved.
 */
export function fileUrl(path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return new URL(`files/${encoded}`, document.baseURI).toString();
}

function triggerDownload(href: string, fileName: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadMaterial(path: string, fileName: string): Promise<void> {
  triggerDownload(fileUrl(path), fileName);
}

/** Open a file in a new tab (PDFs, HTML, video, text) instead of saving it. */
export async function previewMaterial(path: string): Promise<void> {
  const w = window.open(fileUrl(path), '_blank', 'noopener');
  if (!w) throw new Error('Your browser blocked the new tab. Allow pop-ups for this site or use Download.');
}
