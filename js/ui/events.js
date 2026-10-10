/**
 * One place that listens for clicks and form submits.
 *
 *   <button data-act="save-post" data-id="p1">   -> onClick('save-post', (el, event) => ...)
 *   <form data-form="comment">                   -> onSubmit('comment', (form, f) => ...)
 *
 * Each feature file registers its own handlers, so the code for a feature stays together.
 */
import { $, $$ } from '../lib/dom.js';

const clicks = {};
const submits = {};
export const onClick = (name, fn) => { clicks[name] = fn; };
export const onSubmit = (name, fn) => { submits[name] = fn; };

/** Helpers passed to every form handler. */
function helpers(form) {
  const fd = new FormData(form);
  return {
    data: fd,
    val: (k) => String(fd.get(k) || '').trim(),
    all: (k) => fd.getAll(k),
    /** Show an error under the form and move focus to the field that needs fixing. */
    fail(message, field) {
      const p = $('[data-err]', form);
      if (p) { p.textContent = message; p.hidden = false; p.setAttribute('role', 'alert'); }
      const input = field && form.elements[field];
      if (input && input.focus) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
      return false;
    },
  };
}

export function startEvents({ closeOverlay }) {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#overlay a[href]')) setTimeout(() => closeOverlay(true), 0);
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = clicks[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'A' && !el.hasAttribute('data-intercept')) return; // links navigate normally
    fn(el, e);
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
    const fn = submits[form.dataset.form];
    if (fn) fn(form, helpers(form));
  });
}
