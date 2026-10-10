/**
 * Pages are addressed with the part of the URL after #, e.g. #/app/community.
 * Each feature file registers its pages with addRoute():
 *
 *   addRoute('/app/post/:id', 'app', (id, query) => ({ title, html, after }))
 *
 * mode: 'site' (landing page), 'public' (log in, pricing...) or 'app' (needs an account).
 * A page returns null if it redirected somewhere else.
 */
import { $ } from './lib/dom.js';
import { S } from './state.js';
import { closeOverlay } from './ui/overlay.js';
import { renderShell, updateSiteHeader } from './ui/shell.js';

const routes = [];
let timers = [];

export function addRoute(pattern, mode, view, nav) {
  routes.push({ mode, view, nav, re: new RegExp('^' + pattern.replace(/:[a-z]+/g, '([^/]+)') + '$') });
}
/** Run something on an interval while the current page is open. */
export const keepTimer = (id) => timers.push(id);

export function go(hash, replace) {
  if (replace) { history.replaceState(null, '', hash); route(); }
  else if (location.hash === hash) route();
  else location.hash = hash;
}

function parse() {
  const h = location.hash || '#/';
  if (!h.startsWith('#/')) return null;
  const [path, q = ''] = h.slice(1).split('?');
  return { path: path.replace(/\/+$/, '') || '/', query: Object.fromEntries(new URLSearchParams(q)) };
}

function show(mode) {
  const inApp = mode === 'app';
  $('#site').hidden = inApp; $('#app').hidden = !inApp;
  $('#landing').hidden = mode !== 'site'; $('#public').hidden = mode !== 'public';
  document.body.classList.toggle('in-app', inApp);
}

function focusHeading(root) {
  const h = root.querySelector('h1');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

export function route({ keepScroll } = {}) {
  closeOverlay(true);
  timers.forEach(clearInterval); timers = [];
  const r = parse();
  if (!r) { // a plain anchor like #how on the landing page
    show('site'); updateSiteHeader();
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
    return;
  }
  let match = null; let params = [];
  for (const rt of routes) { const m = r.path.match(rt.re); if (m) { match = rt; params = m.slice(1).map(decodeURIComponent); break; } }
  if (!match) { go('#/', true); return; }
  if (match.mode === 'app' && !S.me) { go('#/signup?next=' + encodeURIComponent(location.hash.slice(1)), true); return; }

  const page = match.view(...params, r.query);
  if (!page) return;

  show(match.mode);
  if (match.mode === 'site') {
    document.title = 'aceitacademy | Ace your syllabus. Never study alone.';
    updateSiteHeader();
  } else if (match.mode === 'public') {
    $('#public').innerHTML = page.html;
    document.title = `${page.title} | aceitacademy`;
    updateSiteHeader();
    focusHeading($('#public'));
  } else {
    renderShell(page.nav || match.nav);
    $('#view').innerHTML = page.html;
    document.title = `${page.title} | aceitacademy`;
    if (!keepScroll) focusHeading($('#view'));
  }
  if (!keepScroll) window.scrollTo(0, 0);
  if (page.after) page.after();
}

/** Re-draw the current page after a change, keeping scroll position and focus. */
export function refresh() {
  const y = window.scrollY; const active = document.activeElement; let selector = null;
  if (active && active.dataset && active.dataset.act) {
    selector = `[data-act="${active.dataset.act}"]` + ['id', 'key', 'dir', 'e', 'v', 'post'].map((k) => (active.dataset[k] ? `[data-${k}="${CSS.escape(active.dataset[k])}"]` : '')).join('');
  } else if (active && active.id) selector = '#' + CSS.escape(active.id);
  route({ keepScroll: true });
  window.scrollTo(0, y);
  if (selector) { const n = $(selector); if (n) n.focus({ preventScroll: true }); }
}
