import { esc, $ } from './dom.js';
import { toast, openModal } from '../ui/overlay.js';

const pageUrl = (hash) => location.href.split('#')[0] + hash;

/** Share a page with the phone's share sheet, or copy the link. */
export async function shareLink(hash, title) {
  const url = pageUrl(hash);
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); toast('Link copied'); }
  catch (e) {
    openModal('Share', `<div class="field"><label for="share-url">Copy this link</label><input class="input" id="share-url" value="${esc(url)}" readonly></div>`,
      { after: () => $('#share-url').select() });
  }
}

/** Save text as a file on the student's device. */
export function downloadFile(name, text, url) {
  const a = document.createElement('a');
  a.href = url || URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  if (!url) setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Demo-only credential comparison. Production authentication belongs on the server. */
export async function hashText(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 5381; for (const c of text) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return 'x' + h;
  }
}
