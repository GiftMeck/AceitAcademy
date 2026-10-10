/** Study Together: sessions students start, join and work through together. */
import { $, esc, uid, plural } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { now, ago, when, MIN, HOUR, DAY } from '../lib/time.js';
import { SUBJECTS, CURRICULA, getSubject, getTopic, curriculumName } from '../data/subjects.js';
import { hasNotes } from '../data/topics.js';
import { REPUTATION } from '../data/badges.js';
import { S, me, my, save, addReputation, logActivity, notify, award } from '../state.js';
import { addRoute, go, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { openModal, closeOverlay, toast } from '../ui/overlay.js';
import { flair, avatar, illustration, crumbs } from '../ui/components.js';
import { mySubjects } from './progress.js';
import { subscribeToSessionRoom, broadcastSessionMessage } from '../lib/supabase.js';

const findSession = (id) => S.sessions.find((x) => x.id === id);
let roomTab = 'chat';
let activeChannel = null;
let activeSessionId = null;

function sessionCard(s) {
  const a = me(); const member = s.members.includes(a.username); const full = s.members.length >= s.cap;
  return `<article class="session">
    <div class="post-meta">${flair(s.subject)}<span class="tag">${esc(curriculumName(s.cur))}</span>${s.host === a.username ? '<span class="tag good">You\u2019re hosting</span>' : member ? '<span class="tag good">Joined</span>' : ''}</div>
    <h3><a href="#/app/session/${s.id}">${esc(s.title)}</a></h3>
    <span class="when">${icon('clock', 16)}${when(s.when)}</span>
    <div class="post-meta">${avatar(s.host, 'sm')}<span>Started by <b style="color:var(--text)">${esc(s.host === a.username ? 'you' : s.host)}</b></span></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <span style="display:flex;align-items:center;gap:12px"><span class="av-stack">${s.members.slice(0, 4).map((m) => avatar(m, 'sm')).join('')}</span><span class="muted small">${s.members.length} of ${s.cap}</span></span>
      ${member ? `<a class="btn-quiet" href="#/app/session/${s.id}">Open</a>` : `<button class="btn btn-sm" type="button" data-act="join" data-id="${s.id}" ${full ? 'disabled' : ''}>${full ? 'Full' : 'Join'}</button>`}
    </div></article>`;
}

addRoute('/app/study', 'app', (query) => {
  const a = me(); const f = query.subject || 'all';
  const upcoming = S.sessions.filter((s) => s.when > now() - 3 * HOUR && (f === 'all' || s.subject === f)).sort((x, y) => x.when - y.when);
  const mine = upcoming.filter((s) => s.members.includes(a.username));
  const open = upcoming.filter((s) => !s.members.includes(a.username));
  const chip = (id, label) => `<a class="btn-quiet${f === id ? ' on' : ''}" href="#/app/study${id === 'all' ? '' : `?subject=${id}`}"${f === id ? ' aria-current="true"' : ''}>${label}</a>`;
  return { title: 'Study Together', nav: 'study', html: `
  <section class="feature-head dark"><div><h1>Study together.</h1><p>Pick a topic, invite friends and work through it together. Ask questions as you go and share what helps.</p>
    <button class="btn btn-sm" type="button" data-act="new-session">${icon('plus', 18)}Start a session</button></div>
    </section>
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter by subject">${chip('all', 'All')}${SUBJECTS.map((s) => chip(s.id, s.name)).join('')}</div></div>
  <h2 style="font-size:1.25rem;margin:8px 0 12px">Your sessions</h2>
  ${mine.length ? `<div class="session-grid">${mine.map(sessionCard).join('')}</div>` : '<div class="card"><p class="muted" style="margin:0">You haven\u2019t joined a session yet. Join one below or start your own.</p></div>'}
  <h2 style="font-size:1.25rem;margin:28px 0 12px">Open sessions</h2>
  ${open.length ? `<div class="session-grid">${open.map(sessionCard).join('')}</div>` : `<div class="card empty">${illustration('together')}<h3>No open sessions here yet.</h3><p>Start one and invite people studying the same thing.</p><button class="btn btn-sm" type="button" data-act="new-session">Start a session</button></div>`}` };
});

addRoute('/app/session/:id', 'app', (id) => {
  const s = findSession(id); if (!s) { go('#/app/study', true); return null; }
  const a = me(); const member = s.members.includes(a.username); const host = s.host === a.username; const t = getTopic(s.topic);
  const who = (name) => esc(name === a.username ? 'You' : name);
  const list = (items, row, empty) => (items.length ? `<ul class="list">${items.map(row).join('')}</ul>` : `<p class="muted">${empty}</p>`);
  const panels = {
    chat: () => `<div class="messages">${s.messages.map((m) => `<div class="m ${m.author === a.username ? 'mine' : 'theirs'}">${m.author === a.username ? '' : `<b class="small">${esc(m.author)}</b><br>`}${esc(m.body)}<span class="m-meta">${ago(m.t)}</span></div>`).join('') || '<p class="muted">No messages yet. Say hello.</p>'}</div>
      ${member ? `<form class="composer" data-form="session-message" data-id="${s.id}"><label class="sr-only" for="sm">Message</label><input class="input" id="sm" name="body" autocomplete="off" placeholder="Message the group" required><button class="send" type="submit" aria-label="Send">${icon('send', 20)}</button></form>` : ''}`,
    questions: () => list(s.questions, (q) => `<li class="row">${avatar(q.author, 'sm')}<div class="grow"><span class="title">${esc(q.body)}</span><span class="muted small">${who(q.author)}, ${ago(q.t)}</span></div></li>`, 'No questions yet. Stuck on something? Ask the group.')
      + (member ? `<form data-form="session-question" data-id="${s.id}" style="margin-top:12px"><div class="field"><label for="sq">Ask the group</label><input class="input" id="sq" name="body" required placeholder="What are you stuck on?"></div><button class="btn btn-sm" type="submit">Ask</button></form>` : ''),
    resources: () => list(s.resources, (r) => `<li class="row">${icon('file')}<div class="grow">${r.post ? `<a class="title" href="#/app/post/${r.post}">${esc(r.title)}</a>` : r.url ? `<a class="title" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>` : `<span class="title">${esc(r.title)}</span>`}<span class="muted small">Shared by ${r.author === a.username ? 'you' : esc(r.author)}</span></div></li>`, 'Nothing shared yet.')
      + (member ? `<form data-form="session-resource" data-id="${s.id}" style="margin-top:12px"><div class="field"><label for="sr-t">Title</label><input class="input" id="sr-t" name="title" required></div><div class="field"><label for="sr-u">Link</label><input class="input" id="sr-u" name="url" type="url" placeholder="https://" required></div><p class="err" data-err hidden></p><button class="btn btn-sm" type="submit">Share</button></form>` : ''),
  };
  const tabs = { chat: 'Chat', questions: 'Questions', resources: 'Resources' };
  return {
    title: s.title,
    nav: 'study',
    after: () => {
      if (activeSessionId !== s.id) {
        if (activeChannel) { activeChannel.unsubscribe(); activeChannel = null; }
        activeSessionId = s.id;
        activeChannel = subscribeToSessionRoom(s.id, {
          onMessage: (msg) => {
            if (!s.messages.some((m) => m.t === msg.t && m.author === msg.author)) {
              s.messages.push(msg);
              refresh();
            }
          },
        });
      }
    },
    html: `
  ${crumbs([['Study Together', '#/app/study']])}
  <div class="grid-rail"><div>
    <section class="card">
      <div class="post-meta">${flair(s.subject)}<span class="tag">${esc(curriculumName(s.cur))}</span></div>
      <h1 style="font-size:clamp(1.5rem,3.4vw,2.1rem);line-height:1.15;margin:10px 0 8px">${esc(s.title)}</h1>
      <p class="when">${icon('clock', 16)}${when(s.when)}</p>
      <p class="muted" style="margin:0 0 14px">${t ? `Topic: ${hasNotes(s.topic) ? `<a class="link" href="#/app/learn/${s.topic}">${esc(t.name)}</a>` : esc(t.name)}. ` : ''}Started by <b style="color:var(--text)">${esc(host ? 'you' : s.host)}</b>.</p>
      <div class="actions">${member ? (host ? '' : `<button class="btn-quiet" type="button" data-act="leave" data-id="${s.id}">Leave session</button>`) : `<button class="btn btn-sm" type="button" data-act="join" data-id="${s.id}" ${s.members.length >= s.cap ? 'disabled' : ''}>${s.members.length >= s.cap ? 'Session is full' : 'Join session'}</button>`}
        <button class="btn-quiet" type="button" data-act="invite" data-id="${s.id}">${icon('plus', 18)}Invite friends</button>
        <button class="btn-quiet" type="button" data-act="share-link" data-href="#/app/session/${s.id}" data-title="${esc(s.title)}">${icon('share', 18)}Share</button></div>
    </section>
    <section class="card" style="margin-top:14px">
      ${member ? '' : '<p class="notice">Join the session to chat, ask questions and share resources.</p>'}
      <div class="room-tabs" role="group" aria-label="Session view">${Object.entries(tabs).map(([k, l]) => `<button type="button" data-act="room-tab" data-v="${k}" aria-pressed="${roomTab === k}">${l}${k === 'questions' && s.questions.length ? ` (${s.questions.length})` : ''}</button>`).join('')}</div>
      <div class="room-panel">${panels[roomTab]()}</div>
    </section></div>
  <aside class="rail"><section class="card"><h2>${plural(s.members.length, 'person', 'people')} going</h2><ul class="list">${s.members.map((m) => `<li class="row">${avatar(m, 'sm')}<span class="grow title small">${who(m)}</span>${m === s.host ? '<span class="tag">Host</span>' : ''}</li>`).join('')}</ul>
    ${s.invited.length ? `<p class="muted small" style="margin:12px 0 0">Invited: ${esc(s.invited.join(', '))}</p>` : ''}<p class="muted small" style="margin:8px 0 0">${s.cap - s.members.length} spots left</p></section></aside></div>` };
});

/* ---------- Start, join, leave, invite ---------- */
function sessionForm(pre = {}) {
  const sid = pre.subject || mySubjects()[0] || 'mathematics';
  const tomorrow = new Date(now() + DAY).toISOString().slice(0, 10);
  const topicOptions = (subjectId) => getSubject(subjectId).topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
  openModal('Start a study session', `<form data-form="session-create" novalidate>
    <div class="field"><label for="ss-title">Session name</label><input class="input" id="ss-title" name="title" required placeholder="e.g. Indices practice before the mock"></div>
    <div class="cols-2"><div class="field"><label for="ss-sub">Subject</label><select class="input" id="ss-sub" name="subject">${SUBJECTS.map((s) => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
    <div class="field"><label for="ss-topic">Topic</label><select class="input" id="ss-topic" name="topic">${topicOptions(sid)}</select></div></div>
    <div class="cols-2"><div class="field"><label for="ss-date">Date</label><input class="input" id="ss-date" name="date" type="date" value="${tomorrow}" required></div>
    <div class="field"><label for="ss-time">Time</label><input class="input" id="ss-time" name="time" type="time" value="17:00" required></div></div>
    <div class="cols-2"><div class="field"><label for="ss-cap">Maximum people</label><input class="input" id="ss-cap" name="cap" type="number" min="2" max="30" value="8"></div>
    <div class="field"><label for="ss-cur">Syllabus</label><select class="input" id="ss-cur" name="cur">${CURRICULA.map((c) => `<option value="${c.id}" ${me().curriculum === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div></div>
    <fieldset class="field" style="border:0;padding:0;margin:0 0 16px"><legend class="lab" style="margin-bottom:6px">Invite friends</legend>
      <div class="pick">${Object.keys(S.users).map((h) => `<input type="checkbox" id="inv-${esc(h)}" name="invite" value="${esc(h)}"><label for="inv-${esc(h)}">${esc(h)}</label>`).join('')}</div></fieldset>
    <p class="err" data-err hidden></p>
    <div class="actions"><button class="btn" type="submit">Start session</button><button class="btn-quiet" type="button" data-act="close">Cancel</button></div>
  </form>`, { after: () => $('#ss-sub').addEventListener('change', (e) => { $('#ss-topic').innerHTML = topicOptions(e.target.value); }) });
}
onClick('new-session', (el) => { closeOverlay(true); sessionForm({ subject: el.dataset.subject }); });

onSubmit('session-create', (form, f) => {
  const title = f.val('title'); const when_ = new Date(`${f.val('date')}T${f.val('time')}`).getTime();
  if (title.length < 4) return f.fail('Give your session a name.', 'title');
  if (!when_ || Number.isNaN(when_) || when_ < now() - 5 * MIN) return f.fail('Pick a date and time in the future.', 'date');
  const cap = Math.min(30, Math.max(2, parseInt(f.val('cap'), 10) || 8));
  const a = me();
  const s = { id: 's' + uid(), title, subject: f.val('subject'), topic: f.val('topic'), cur: f.val('cur'), when: when_, host: a.username, members: [a.username], invited: f.all('invite'), cap, messages: [], questions: [], resources: [] };
  S.sessions.push(s); my().hosted.push(s.id); addReputation(REPUTATION.hostSession, s.subject); award('host');
  const t = getTopic(s.topic);
  S.posts.unshift({ id: 'u' + uid(), type: 'invite', subject: s.subject, author: a.username, t: now(), score: 0, title: s.title, body: `Study session on ${t ? t.name : 'this topic'}, ${when(when_).toLowerCase()}. Join me.`, sessionId: s.id, reactions: { '👍': 0, '💡': 0, '🔥': 0 }, comments: [] });
  logActivity(`Started "${s.title}"`, `#/app/session/${s.id}`); save(); closeOverlay(true); roomTab = 'chat'; go('#/app/session/' + s.id); toast('Session created');
});

onClick('join', (el) => {
  const s = findSession(el.dataset.id); const a = me(); const d = my();
  if (!s || s.members.includes(a.username) || s.members.length >= s.cap) return;
  s.members.push(a.username); if (!d.joined.includes(s.id)) d.joined.push(s.id);
  logActivity(`Joined "${s.title}"`, `#/app/session/${s.id}`);
  notify(`You joined "${s.title}". It starts ${when(s.when).toLowerCase()}.`, `#/app/session/${s.id}`);
  award('buddy'); save(); toast('You\u2019re in. See you there.'); refresh();
});
onClick('leave', (el) => {
  const s = findSession(el.dataset.id); const u = me().username;
  s.members = s.members.filter((m) => m !== u); my().joined = my().joined.filter((x) => x !== s.id);
  save(); toast('You left the session'); refresh();
});
onClick('room-tab', (el) => { roomTab = el.dataset.v; refresh(); });
onClick('invite', (el) => {
  const s = findSession(el.dataset.id); const people = Object.keys(S.users).filter((h) => !s.members.includes(h));
  openModal('Invite friends', `<form data-form="invite" data-id="${s.id}">
    ${people.length ? `<div class="pick" style="margin-bottom:16px">${people.map((h) => `<input type="checkbox" id="iv-${esc(h)}" name="invite" value="${esc(h)}" ${s.invited.includes(h) ? 'checked' : ''}><label for="iv-${esc(h)}">${esc(h)}</label>`).join('')}</div>` : '<p class="muted">Everyone you know is already in this session.</p>'}
    <p class="muted small">You can also share the link with friends who aren\u2019t on aceitacademy yet.</p>
    <div class="actions">${people.length ? '<button class="btn" type="submit">Send invites</button>' : ''}<button class="btn-quiet" type="button" data-act="share-link" data-href="#/app/session/${s.id}" data-title="${esc(s.title)}">${icon('share', 18)}Share link</button></div>
  </form>`);
});
onSubmit('invite', (form, f) => {
  const s = findSession(form.dataset.id); const picked = f.all('invite');
  s.invited = [...new Set([...s.invited, ...picked])]; save(); closeOverlay(true);
  toast(picked.length ? `Invited ${plural(picked.length, 'friend')}` : 'No one selected'); refresh();
});

onSubmit('session-message', (form, f) => {
  const s = findSession(form.dataset.id); const body = f.val('body'); if (!body) return;
  const msg = { author: me().username, body, t: now() };
  s.messages.push(msg);
  if (activeChannel) broadcastSessionMessage(activeChannel, msg);
  save(); refresh(); const i = $('#sm'); if (i) i.focus();
});
onSubmit('session-question', (form, f) => {
  const s = findSession(form.dataset.id); const body = f.val('body'); if (!body) return;
  s.questions.push({ author: me().username, body, t: now() }); logActivity(`Asked a question in "${s.title}"`, `#/app/session/${s.id}`);
  save(); refresh(); const i = $('#sq'); if (i) i.focus();
});
onSubmit('session-resource', (form, f) => {
  const s = findSession(form.dataset.id); const title = f.val('title'), url = f.val('url');
  if (!title) return f.fail('Add a title.', 'title');
  if (!/^https?:\/\//.test(url)) return f.fail('Add a link that starts with http.', 'url');
  s.resources.push({ author: me().username, title, url, t: now() }); addReputation(REPUTATION.contribution, s.subject); my().contrib++; award('contributor');
  save(); toast('Shared with the group'); refresh();
});
