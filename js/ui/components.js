/** Small pieces of HTML reused across pages. */
import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { getSubject } from '../data/subjects.js';
import { userInfo } from '../state.js';

/**
 * Path to an image in /assets. The single-file preview build fills
 * window.ASSETS with embedded copies; on the real site the file path is used.
 */
export const asset = (path) => (window.ASSETS && window.ASSETS[path]) || path;
const ART = {hero:'hero',stakes:'faq', 'step-learn':'notes','step-questions':'question','step-gaps':'people','step-fix':'progress',together:'discussion',cta:'together',sitter:'laptop',help:'question',promo:'sidebar'};
export const illustration = (name, cls = '', alt = '') => `<img class="${cls}" src="${asset(`assets/illustrations/${ART[name] || name}.png`)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
export const logo = (cls = 'logo') => `<img class="${cls}" src="${asset('assets/logo.svg')}" alt="aceitacademy" width="154" height="54">`;

/** Coloured subject label, e.g. Mathematics */
export function flair(subjectId) {
  const s = getSubject(subjectId);
  return s ? `<span class="flair" style="--c:${s.color}">${esc(s.name)}</span>` : '';
}

const AVATAR_COLOURS = ['#10DC85', '#FFC845', '#F7A1C4', '#9EB0FF', '#FFB08F', '#B9A7F5', '#7FE0C4'];
function colourFor(name) {
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}
const initials = (name) => String(name || '?').replace(/[^A-Za-z\s]/g, ' ').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

/** Initials in a coloured circle. size: '', 'sm' or 'lg' */
export function avatar(handle, size = '') {
  return `<span class="av ${size}" style="background:${colourFor(handle)}" aria-hidden="true">${esc(initials(userInfo(handle).name))}</span>`;
}

/** "Known for Mathematics" label for helpful students. */
export function knownTag(handle) {
  const known = userInfo(handle).known || [];
  return known.slice(0, 1).map((k) => `<span class="known">${icon('star', 12)}Known for ${esc(getSubject(k).name)}</span>`).join('');
}

const STAGES = ['Learn', 'Questions', 'Diagnose', 'Fix', 'Test again', 'Master'];
/** The learning loop with the current step highlighted (0 = Learn … 5 = Master). */
export function loopBar(stage) {
  return `<ol class="loop" aria-label="Learning loop">${STAGES.map((s, i) => `<li class="${i < stage ? 'done' : i === stage ? 'now' : ''}"${i === stage ? ' aria-current="step"' : ''}><span>${s}</span></li>`).join('')}</ol>`;
}

export const crumbs = (links) => `<nav class="crumbs" aria-label="Breadcrumb">${links.map(([label, href], i) => (href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`) + (i < links.length - 1 ? '<span aria-hidden="true">/</span>' : '')).join('')}</nav>`;
