/** Modals, bottom sheets and toasts. */
import { $, $$ } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

let lastFocus = null;
const root = () => $('#overlay');

export function openModal(title, body, { after } = {}) {
  lastFocus = document.activeElement;
  root().innerHTML = `<div class="modal-wrap" data-act="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-h"><h2 id="modal-title">${title}</h2><button class="icon-btn" type="button" data-act="close" aria-label="Close">${icon('x')}</button></div>${body}</div></div>`;
  document.body.classList.add('modal-open');
  $('#site').inert = true; $('#app').inert = true;
  const first = $('#overlay .modal input, #overlay .modal select, #overlay .modal textarea, #overlay .modal button:not([data-act="close"])');
  (first || $('#overlay [data-act="close"]')).focus();
  if (after) after();
}

export function openSheet(body, label, head = '') {
  lastFocus = document.activeElement;
  root().innerHTML = `<div class="sheet-wrap" data-act="backdrop"><div class="sheet" role="dialog" aria-modal="true" aria-label="${label}">
    <div class="sheet-head">${head}<button class="icon-btn" type="button" data-act="close" aria-label="Close menu">${icon('x')}</button></div>${body}</div></div>`;
  document.body.classList.add('modal-open');
  $('#site').inert = true; $('#app').inert = true;
  $('#overlay [data-act="close"]').focus();
}

export function closeOverlay(silent) {
  const had = root().innerHTML !== '';
  root().innerHTML = '';
  document.body.classList.remove('modal-open');
  $('#site').inert = false; $('#app').inert = false;
  if (had && !silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
export const overlayOpen = () => root().innerHTML !== '';

let toastTimer;
export function toast(text) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = text; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

// Escape closes, Tab stays inside the open dialog
document.addEventListener('keydown', (e) => {
  const box = $('#overlay .modal, #overlay .sheet');
  if (!box) return;
  if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
  if (e.key !== 'Tab') return;
  const items = $$('a[href], button:not([disabled]), input, select, textarea', box).filter((x) => x.offsetParent !== null);
  if (!items.length) return;
  const i = items.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
  else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
});
