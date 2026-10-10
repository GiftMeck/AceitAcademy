/** The frame around app pages: sidebar, top bar and mobile tab bar. Plus the site menus. */
import { $, $$, esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { S, me, my } from '../state.js';
import { openSheet } from './overlay.js';
import { avatar, logo, illustration } from './components.js';
import { applyTheme, currentTheme } from './theme.js';

const MAIN_NAV = [
  ['home', 'Home', '#/app/home'], ['subjects', 'Subjects', '#/app/subjects'], ['questions', 'Questions', '#/app/questions'],
  ['community', 'Community', '#/app/community'], ['study', 'Study Together', '#/app/study'], ['notes', 'Notes', '#/app/notes'], ['blog', 'Blogs', '#/app/blogs'],
];
const ACCOUNT_NAV = [['chat', 'Messages', '#/app/chat'], ['bell', 'Notifications', '#/app/notifications'], ['user', 'Profile', '#/app/profile'], ['settings', 'Settings', '#/app/settings']];
const TABS = [['home', 'Home', '#/app/home'], ['subjects', 'Subjects', '#/app/subjects'], ['questions', 'Questions', '#/app/questions'], ['community', 'Community', '#/app/community'], ['study', 'Study', '#/app/study']];

export function renderShell(active) {
  const a = me(); const unread = my().notifs.filter((n) => !n.read).length;
  const current = (k) => (k === active ? ' aria-current="page"' : '');
  $('#side').innerHTML = `
    <a class="brand" href="#/" aria-label="aceit academy home page">${logo()}</a>
    <nav aria-label="Main">${MAIN_NAV.map(([k, l, h]) => `<a class="nav-i" href="${h}"${current(k)}>${icon(k)}<span>${l}</span></a>`).join('')}</nav>
    <hr>
    <nav aria-label="Account">${ACCOUNT_NAV.map(([k, l, h]) => `<a class="nav-i" href="${h}"${current(k)}>${icon(k)}<span>${l}</span>${k === 'bell' && unread ? `<span class="count" aria-label="${unread} unread">${unread}</span>` : ''}</a>`).join('')}</nav>
    <div class="promo"><b>Never study alone.</b><span>Different students. Same goals.</span><a href="#/app/study">Find a session</a></div>`;
  $('#topbar').innerHTML = `
    <a class="brand" href="#/app/home" aria-label="aceit academy home">${logo()}</a>
    <form class="search" role="search" data-form="search"><span aria-hidden="true">${icon('search', 18)}</span><label class="sr-only" for="q">Search</label><input id="q" name="q" type="search" placeholder="Search subjects, topics or questions" autocomplete="off"></form>
    <div class="top-actions">
      <a class="icon-btn search-btn" href="#/app/search" aria-label="Search">${icon('search')}</a>
      <button class="icon-btn" data-act="theme" aria-label="Switch theme"></button>
      <a class="icon-btn" href="#/app/notifications" aria-label="Notifications${unread ? `, ${unread} unread` : ''}">${icon('bell')}${unread ? '<span class="dot"></span>' : ''}</a>
      <button class="me-btn" data-act="account" aria-label="Account menu">${avatar(a.username, 'sm')}<span class="me-name">${esc(a.name.split(' ')[0])}</span></button>
    </div>`;
  $('#tabs').innerHTML = TABS.map(([k, l, h]) => `<a href="${h}"${current(k)}>${icon(k, 22)}<span>${l}</span></a>`).join('');
  applyTheme();
}

/** Public header shows "Open app" instead of "Log in" once signed in. */
export function updateSiteHeader() {
  $$('.js-login').forEach((a) => { a.textContent = S.me ? 'Open app' : 'Log in'; a.setAttribute('href', S.me ? '#/app/home' : '#/login'); });
}

export function siteMenu() {
  const dark = currentTheme() === 'dark';
  openSheet(`<nav aria-label="Site">
    <a href="#subjects">Subjects</a><a href="#how">How it works</a><a href="#community">Community</a><a href="#together">Study together</a><a href="#pricing">Pricing</a>
    <a href="#/blogs">Blogs</a><a href="#/contact">Contact</a><a href="${S.me ? '#/app/home' : '#/login'}">${S.me ? 'Open app' : 'Log in'}</a>
    <button type="button" data-act="theme-row">${icon(dark ? 'sun' : 'moon')} ${dark ? 'Light mode' : 'Dark mode'}</button>
  </nav><a class="btn" href="#/start">Start learning</a>`, 'Menu', logo());
}

export function accountMenu() {
  const a = me();
  openSheet(`<p style="display:flex;gap:12px;align-items:center;margin:4px 0 8px">${avatar(a.username)}<span><b>${esc(a.name)}</b><br><span class="muted small">@${esc(a.username)}</span></span></p>
  <nav aria-label="Account">
    <a href="#/app/profile">${icon('user')} Profile</a><a href="#/app/notes">${icon('notes')} Notes</a><a href="#/app/blogs">${icon('blog')} Blogs</a>
    <a href="#/app/chat">${icon('chat')} Messages</a><a href="#/app/notifications">${icon('bell')} Notifications</a><a href="#/app/resources">${icon('upload')} Upload and download resources</a>
    <a href="#/app/pricing">${icon('star')} Pricing</a><a href="#/app/settings">${icon('settings')} Settings</a><a href="#/contact">${icon('comment')} Contact</a>
    <a href="#/">${icon('home')} aceitacademy home page</a>
    <button type="button" data-act="logout">${icon('logout')} Log out</button>
  </nav>`, 'Account menu', logo());
}
