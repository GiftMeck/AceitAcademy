/** Notifications, profile, settings and plans inside the app. */
import { esc, plural, joinWords } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { ago } from '../lib/time.js';
import { SUBJECTS, CURRICULA, getSubject, getTopic, curriculumName } from '../data/subjects.js';
import { BADGES, REPUTATION } from '../data/badges.js';
import { S, me, my, save, knownFor, usernameTaken, renameEverywhere, resetMyProgress } from '../state.js';
import { addRoute, go, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { openModal, closeOverlay, toast } from '../ui/overlay.js';
import { setTheme } from '../ui/theme.js';
import { avatar, flair } from '../ui/components.js';
import { masteredTopics, topicsWithGaps, skillNames, mySubjects } from './progress.js';
import { resetPractice } from './practice.js';
import { pricingCards, planName, pickGroup, USERNAME, USERNAME_RULE } from './public.js';

/* ---------- Notifications ---------- */
addRoute('/app/notifications', 'app', () => {
  const list = my().notifs;
  return { title: 'Notifications', nav: 'bell', html: `
  <div class="page-h"><div><h1>Notifications</h1></div>${list.some((n) => !n.read) ? '<button class="btn-quiet" type="button" data-act="mark-read">Mark all as read</button>' : ''}</div>
  <section class="card"><ul class="list">${list.map((n) => `<li class="row">${n.read ? '' : '<span style="width:10px;height:10px;border-radius:50%;background:var(--orange);flex:none" role="img" aria-label="Unread"></span>'}<div class="grow">${n.link ? `<a class="title" href="${n.link}">${esc(n.text)}</a>` : `<span class="title">${esc(n.text)}</span>`}<span class="muted small">${ago(n.t)}</span></div></li>`).join('') || '<li class="muted">You\u2019re all caught up.</li>'}</ul></section>` };
});
onClick('mark-read', () => { my().notifs.forEach((n) => { n.read = true; }); save(); refresh(); });

/* ---------- Profile ---------- */
addRoute('/app/profile', 'app', () => {
  const a = me(); const d = my();
  const answers = S.posts.reduce((n, p) => n + p.comments.filter((c) => c.author === a.username).length, 0);
  const accepted = S.posts.reduce((n, p) => n + p.comments.filter((c) => c.author === a.username && p.acceptedId === c.id).length, 0);
  const main = getSubject(a.main || mySubjects()[0]); const known = knownFor(); const mastered = masteredTopics(); const gaps = topicsWithGaps();
  return { title: 'Profile', nav: 'user', html: `
  <section class="card"><div class="profile-head">${avatar(a.username, 'lg')}<div><h1>${esc(a.name)}</h1>
    <p class="line" style="margin:2px 0 0">${esc(main ? main.name : '')} · ${esc(curriculumName(a.curriculum))}</p><p class="muted small" style="margin:2px 0 0">@${esc(a.username)}</p></div></div>
    <div class="actions" style="margin-top:14px"><button class="btn-quiet" type="button" data-act="edit-profile">Edit profile</button></div></section>
  <div class="stats" style="margin-top:16px">
    <div class="stat"><b>${d.answered}</b><span>questions answered</span></div>
    <div class="stat"><b>${mastered.length}</b><span>topics mastered</span></div>
    <div class="stat"><b>${accepted}</b><span>helpful answers</span></div>
    <div class="stat"><b>${d.joined.length + d.hosted.length}</b><span>study sessions</span></div>
  </div>
  <div class="cols-2" style="margin-top:16px">
    <section class="card"><h2>What I\u2019ve learned</h2>${mastered.length ? `<ul class="list">${mastered.map((tid) => `<li class="row"><span class="grow title">${esc(getTopic(tid).name)}</span>${flair(getTopic(tid).subject.id)}</li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Master a topic and it will show up here.</p>'}</section>
    <section class="card"><h2>Where I\u2019m struggling</h2>${gaps.length ? `<ul class="list">${gaps.map(([tid, p]) => `<li class="row"><div class="grow"><span class="title">${esc(getTopic(tid).name)}</span><span class="muted small">${esc(joinWords(skillNames(tid, p.gaps)))}</span></div><a class="btn-quiet" href="#/app/fix/${tid}">Fix</a></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">No gaps right now.</p>'}</section>
    <section class="card"><h2>What I\u2019m good at</h2>
      <p style="margin:0 0 10px"><b style="font-size:1.6rem;letter-spacing:-0.03em">${d.rep}</b> <span class="muted">reputation from ${plural(answers, 'answer')} and ${plural(d.contrib, 'contribution')}</span></p>
      ${known.length ? known.map((k) => `<span class="known">${icon('star', 12)}Known for ${esc(getSubject(k).name)}</span>`).join(' ') : `<p class="muted small" style="margin:0">Earn ${REPUTATION.knownForThreshold} reputation in one subject to be known for it.</p>`}</section>
    <section class="card"><h2>Badges</h2><div class="badges">${BADGES.map((b) => { const got = d.badges.includes(b.id);
      return `<div class="badge-i${got ? '' : ' locked'}" style="--c:${b.color}" title="${esc(b.desc)}"><span class="medal">${icon(got ? 'star' : 'target', 16)}</span><span>${esc(b.name)}<span class="sr-only">${got ? ', earned' : ', not yet earned'}: ${esc(b.desc)}</span></span></div>`; }).join('')}</div></section>
  </div>
  <section class="card" style="margin-top:16px"><h2>Recent activity</h2>${d.activity.length ? `<ul class="list">${d.activity.slice(0, 10).map((x) => `<li class="row"><div class="grow">${x.link ? `<a class="title" href="${x.link}">${esc(x.text)}</a>` : `<span class="title">${esc(x.text)}</span>`}<span class="muted small">${ago(x.t)}</span></div></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Your learning and contributions will show up here.</p>'}</section>` };
});

onClick('edit-profile', () => {
  const a = me();
  openModal('Edit profile', `<form data-form="profile-edit" novalidate>
    <div class="field"><label for="pe-name">Name</label><input class="input" id="pe-name" name="name" value="${esc(a.name)}" required></div>
    <div class="field"><label for="pe-user">Username</label><input class="input" id="pe-user" name="username" value="${esc(a.username)}" required></div>
    <div class="field"><label for="pe-main">Main subject</label><select class="input" id="pe-main" name="main">${SUBJECTS.map((s) => `<option value="${s.id}" ${(a.main || mySubjects()[0]) === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
    ${pickGroup('Syllabus', 'radio', 'curriculum', CURRICULA, (c) => a.curriculum === c.id)}
    ${pickGroup('Subjects', 'checkbox', 'subjects', SUBJECTS, (s) => mySubjects().includes(s.id))}
    <p class="err" data-err hidden></p>
    <div class="actions"><button class="btn" type="submit">Save changes</button><button class="btn-quiet" type="button" data-act="close">Cancel</button></div></form>`);
});
onSubmit('profile-edit', (form, f) => {
  const a = me(); const name = f.val('name'), username = f.val('username'), subjects = f.all('subjects');
  if (!name) return f.fail('Enter your name.', 'name');
  if (!USERNAME.test(username)) return f.fail(USERNAME_RULE, 'username');
  if (username.toLowerCase() !== a.username.toLowerCase() && usernameTaken(username, a.email)) return f.fail('That username is taken. Try another.', 'username');
  if (!subjects.length) return f.fail('Pick at least one subject.');
  if (username !== a.username) renameEverywhere(a.username, username);
  Object.assign(a, { name, username, subjects, main: f.val('main'), curriculum: f.val('curriculum') || a.curriculum });
  save(); closeOverlay(true); toast('Profile updated'); refresh();
});

/* ---------- Settings ---------- */
const seg = (label, items, act, isOn) => `<div class="seg" role="group" aria-label="${label}">${items.map(([v, l]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${isOn(v)}">${l}</button>`).join('')}</div>`;

addRoute('/app/settings', 'app', () => {
  const a = me();
  return { title: 'Settings', nav: 'settings', html: `
  <div class="page-h"><div><h1>Settings</h1></div></div>
  <div class="stack" style="max-width:720px">
    <section class="card"><h2>Appearance</h2>${seg('Theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], 'set-theme', (v) => S.theme === v)}</section>
    <section class="card"><h2>Reading reminder</h2><p class="muted">We\u2019ll nudge you to switch to questions after this much reading.</p>
      ${seg('Reading reminder', [15, 20, 25, 30].map((m) => [m, `${m} min`]), 'set-nudge', (v) => S.nudgeMin === v)}</section>
    <section class="card"><h2>Syllabus</h2>${seg('Syllabus', CURRICULA.map((c) => [c.id, c.name]), 'set-curriculum', (v) => a.curriculum === v)}</section>
    <section class="card"><h2>Plan</h2><p style="margin:0 0 12px">${esc(planName(a.plan))}</p><a class="btn-quiet" href="#/app/pricing">See plans</a></section>
    <section class="card"><h2>Account</h2><p class="muted" style="margin:0 0 12px">Signed in as ${esc(a.email)}</p>
      <div class="actions"><button class="btn-quiet" type="button" data-act="logout">${icon('logout', 18)}Log out</button><button class="btn-quiet" type="button" data-act="reset-data" style="color:var(--danger)">Reset my progress</button></div></section>
  </div>` };
});
onClick('set-theme', (el) => { setTheme(el.dataset.v); refresh(); });
onClick('set-nudge', (el) => { S.nudgeMin = +el.dataset.v; save(); toast(`We\u2019ll nudge you after ${S.nudgeMin} minutes`); refresh(); });
onClick('reset-data', () => openModal('Reset your progress?', `<p class="muted">This clears your questions, mastered topics, saved posts, badges and messages. Your account stays.</p>
  <div class="actions" style="margin-top:16px"><button class="btn" type="button" data-act="confirm-reset" style="background:var(--danger);color:#fff">Reset progress</button><button class="btn-quiet" type="button" data-act="close">Keep everything</button></div>`));
onClick('confirm-reset', () => { resetMyProgress(); resetPractice(); closeOverlay(true); go('#/app/home'); toast('Progress reset'); });

/* ---------- Plans ---------- */
addRoute('/app/pricing', 'app', () => ({ title: 'Plans', nav: 'user', html: `
  <div class="page-h"><div><h1>Plans</h1><p>Your current plan: ${esc(planName(me().plan))}</p></div></div>
  <div id="pricing-slot">${pricingCards(true)}</div>
  <p class="muted small" style="text-align:center;margin-top:24px">Online payment is not connected yet. Choosing a plan saves your choice.</p>` }));
