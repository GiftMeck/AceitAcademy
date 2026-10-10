/** Light and dark mode. */
import { $$ } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { S, save } from '../state.js';

export const currentTheme = () => document.documentElement.dataset.theme;

export function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $$('[data-act="theme"]').forEach((b) => {
    b.innerHTML = icon(dark ? 'sun' : 'moon', 18) + `<span>${dark ? 'Light mode' : 'Dark mode'}</span>`;
    b.setAttribute('aria-pressed', String(dark));
    b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

export function setTheme(value) { S.theme = value; applyTheme(); save(); }
export function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
