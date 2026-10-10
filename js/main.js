/**
 * aceitacademy — start-up.
 *
 * Folder guide:
 *   config.js     settings you might change (contact email, reading reminder)
 *   state.js      everything the site remembers, and helpers to change it
 *   router.js     which page shows for which URL
 *   data/         subjects, notes, questions, blog posts, sample community
 *   ui/           shared pieces: shell, modals, theme, small components, click handling
 *   features/     one file per part of the product (community, study together...)
 */
import { $ } from './lib/dom.js';
import { S, loadState } from './state.js';
import { route } from './router.js';
import { onClick, startEvents } from './ui/events.js';
import { closeOverlay } from './ui/overlay.js';
import { applyTheme, toggleTheme } from './ui/theme.js';
import { siteMenu, accountMenu } from './ui/shell.js';

// Each feature registers its own pages and buttons
import { fillLandingPricing } from './features/public.js';
import './features/home.js';
import './features/learn.js';
import './features/practice.js';
import './features/community.js';
import './features/study.js';
import './features/chat.js';
import './features/account.js';
import './features/library.js';
import './features/blogs-public.js';
import './features/welcome.js';

// Buttons that work everywhere
onClick('close', () => closeOverlay());
onClick('backdrop', (el, e) => { if (e.target === el) closeOverlay(); });
onClick('theme', (el) => { toggleTheme(); el.focus(); });
onClick('theme-row', () => { toggleTheme(); closeOverlay(); });
onClick('menu', () => siteMenu());
onClick('account', () => accountMenu());
onClick('skip', (el, e) => {
  e.preventDefault();
  const main = !$('#app').hidden ? $('#view') : !$('#public').hidden ? $('#public') : $('#landing');
  main.setAttribute('tabindex', '-1'); main.focus();
});

/** Show the "Start Learning" bar on phones once the hero buttons scroll away. */
function startDock() {
  const heroActions = $('#hero-actions'); const dock = $('#dock');
  if (!heroActions || !dock || !('IntersectionObserver' in window)) return;
  let pastHero = false; const ends = new Set();
  const update = () => dock.classList.toggle('show', pastHero && !ends.size && !$('#landing').hidden && !$('#site').hidden);
  new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting && en.boundingClientRect.top < 0; update(); }).observe(heroActions);
  const endObserver = new IntersectionObserver((entries) => { entries.forEach((en) => (en.isIntersecting ? ends.add(en.target) : ends.delete(en.target))); update(); });
  endObserver.observe($('#join')); endObserver.observe($('.foot'));
  window.addEventListener('hashchange', update);
}

async function start() {
  await loadState();
  applyTheme();
  fillLandingPricing();
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (S.theme === 'system') applyTheme(); });
  startEvents({ closeOverlay });
  window.addEventListener('hashchange', () => route());
  route();
  startDock();
}
start();
