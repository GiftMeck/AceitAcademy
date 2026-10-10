/** Notes, blogs, search and shared resources. */
import { esc, uid } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { now, ago, when } from '../lib/time.js';
import { shareLink, downloadFile } from '../lib/share.js';
import { SUBJECTS, getSubject, getTopic } from '../data/subjects.js';
import { BLOGS } from '../data/blogs.js';
import { REPUTATION } from '../data/badges.js';
import { S, me, my, save, addReputation, logActivity, award } from '../state.js';
import { addRoute, go, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { toast } from '../ui/overlay.js';
import { flair, crumbs } from '../ui/components.js';
import { mySubjects, topicsWithNotes, statusTag } from './progress.js';
import { postCard } from './community.js';
import { notesAsText } from './learn.js';

/* ---------- Notes ---------- */
addRoute('/app/notes', 'app', () => {
  const saved = my().savedNotes;
  return { title: 'Notes', nav: 'notes', html: `
  <div class="page-h"><div><h1>Notes</h1><p>Clear, focused notes and resources for your subjects.</p></div><a class="btn-quiet" href="#/app/resources">${icon('upload', 18)}Resources</a></div>
  <div class="stack">
    <section class="card"><h2>Saved</h2>${saved.length ? `<ul class="list">${saved.map((tid) => `<li class="row"><div class="grow"><a class="title" href="#/app/learn/${tid}">${esc(getTopic(tid).name)}</a><span style="margin-top:4px;display:flex">${flair(getTopic(tid).subject.id)}</span></div>
      <button class="btn-quiet" type="button" data-act="download-note" data-id="${tid}" aria-label="Download ${esc(getTopic(tid).name)} notes">${icon('download', 18)}</button></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Tap Save on any notes page to keep them here.</p>'}</section>
    ${mySubjects().map((sid) => { const ready = topicsWithNotes(sid);
      return `<section class="card"><div class="card-h"><h2>${esc(getSubject(sid).name)}</h2><a class="link small" href="#/app/subjects/${sid}">All topics</a></div>
      ${ready.length ? `<ul class="list">${ready.map((t) => `<li class="row"><div class="grow"><a class="title" href="#/app/learn/${t.id}">${esc(t.name)}</a><span style="margin-top:4px;display:flex">${statusTag(t.id)}</span></div></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Notes for this subject are on the way.</p>'}</section>`; }).join('')}
  </div>` };
});

/* ---------- Blogs ---------- */
addRoute('/app/blogs', 'app', () => ({ title: 'Blogs', nav: 'blog', html: `
  <div class="page-h"><div><h1>Blogs</h1><p>Study advice from the aceitacademy team and community.</p></div></div>
  <div class="stack">${BLOGS.map((b) => `<article class="card"><span class="tag">${esc(b.tag || 'Study skills')}</span><h2 style="margin-top:10px"><a href="#/app/blog/${b.id}" style="color:inherit;text-decoration:none">${esc(b.title)}</a></h2>
    <p class="muted">${esc(b.intro)}</p><p class="small muted" style="margin:0">${esc(b.author)} · ${b.minutes} min read</p></article>`).join('')}</div>` }));

addRoute('/app/blog/:id', 'app', (id) => {
  const b = BLOGS.find((x) => x.id === id); if (!b) { go('#/app/blogs', true); return null; }
  return { title: b.title, nav: 'blog', html: `
  ${crumbs([['Blogs', '#/app/blogs']])}
  <article class="reader"><span class="tag">${esc(b.tag || 'Study skills')}</span><h1 style="margin:12px 0 8px">${esc(b.title)}</h1><p class="muted small">${esc(b.author)} · ${b.minutes} min read</p>
    <p class="intro">${esc(b.intro)}</p>${b.body}
    <div class="actions" style="margin-top:24px"><button class="btn-quiet" type="button" data-act="share-link" data-href="#/app/blog/${b.id}" data-title="${esc(b.title)}">${icon('share', 18)}Share</button></div></article>` };
});

/* ---------- Search ---------- */
addRoute('/app/search', 'app', (query) => {
  const q = (query.q || '').trim(); const l = q.toLowerCase(); const has = (text) => String(text).toLowerCase().includes(l);
  const topics = q ? SUBJECTS.flatMap((s) => s.topics.filter((t) => has(t.name) || has(s.name)).map((t) => ({ ...t, s }))) : [];
  const posts = q ? S.posts.filter((p) => has(p.title) || has(p.body)) : [];
  const sessions = q ? S.sessions.filter((s) => has(s.title)) : [];
  const blogs = q ? BLOGS.filter((b) => has(b.title) || has(b.intro)) : [];
  const nothing = q && !topics.length && !posts.length && !sessions.length && !blogs.length;
  return { title: q ? `Search: ${q}` : 'Search', html: `
  <div class="page-h"><div><h1>${q ? `Results for \u201c${esc(q)}\u201d` : 'Search'}</h1></div></div>
  <form class="card" data-form="search" style="margin-bottom:16px"><label class="sr-only" for="q2">Search</label>
    <div style="display:flex;gap:10px"><input class="input" id="q2" name="q" type="search" value="${esc(q)}" placeholder="Search subjects, topics or questions"><button class="btn btn-sm" type="submit">Search</button></div></form>
  ${nothing ? `<div class="card empty"><h3>Nothing matches yet.</h3><p>Ask the community. Someone studying the same syllabus can probably help.</p><button class="btn btn-sm" type="button" data-act="compose" data-title="${esc(q)}">Ask the community</button></div>` : ''}
  ${topics.length ? `<section class="card" style="margin-bottom:14px"><h2>Topics</h2><ul class="list">${topics.map((t) => `<li class="row"><div class="grow"><a class="title" href="#/app/learn/${t.id}">${esc(t.name)}</a><span style="display:flex;gap:8px;margin-top:4px">${flair(t.s.id)}${statusTag(t.id)}</span></div></li>`).join('')}</ul></section>` : ''}
  ${posts.length ? `<section class="card" style="margin-bottom:14px"><h2>Community</h2>${posts.map((p) => postCard(p, true)).join('')}</section>` : ''}
  ${sessions.length ? `<section class="card" style="margin-bottom:14px"><h2>Study sessions</h2><ul class="list">${sessions.map((s) => `<li class="row"><div class="grow"><a class="title" href="#/app/session/${s.id}">${esc(s.title)}</a><span class="muted small">${when(s.when)}</span></div></li>`).join('')}</ul></section>` : ''}
  ${blogs.length ? `<section class="card"><h2>Blogs</h2><ul class="list">${blogs.map((b) => `<li class="row"><a class="title" href="#/app/blog/${b.id}">${esc(b.title)}</a></li>`).join('')}</ul></section>` : ''}` };
});
onSubmit('search', (form, f) => { const q = f.val('q'); if (q) go('#/app/search?q=' + encodeURIComponent(q)); });

/* ---------- Resources ---------- */
const FILES = {}; // files uploaded in this visit (the file itself isn't saved yet, only its name)
addRoute('/app/resources', 'app', () => ({ title: 'Resources', nav: 'notes', html: `
  <div class="page-h"><div><h1>Resources</h1><p>Notes, past papers and worked solutions shared by students.</p></div></div>
  <div class="grid-rail"><section class="card"><ul class="list">${S.resources.slice().sort((x, y) => y.t - x.t).map((r) => `<li class="row">${icon('file')}<div class="grow"><span class="title">${esc(r.title)}</span>
    <span style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${flair(r.subject)}<span class="tag">${esc(r.kind)}</span><span class="muted small">${esc(r.author === me().username ? 'You' : r.author)}, ${ago(r.t)}</span></span></div>
    <button class="btn-quiet" type="button" data-act="download-res" data-id="${r.id}" aria-label="Download ${esc(r.title)}">${icon('download', 18)}</button></li>`).join('')}</ul></section>
  <aside class="rail"><section class="card"><h2>Share something</h2>
    <form data-form="upload" novalidate>
      <div class="field"><label for="up-file">File</label><input class="input" id="up-file" name="file" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"></div>
      <div class="field"><label for="up-title">Title</label><input class="input" id="up-title" name="title" required placeholder="e.g. Osmosis summary sheet"></div>
      <div class="field"><label for="up-sub">Subject</label><select class="input" id="up-sub" name="subject">${SUBJECTS.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
      <div class="field"><label for="up-kind">Type</label><select class="input" id="up-kind" name="kind"><option>Notes</option><option>Past paper</option><option>Worked solution</option><option>Other</option></select></div>
      <p class="err" data-err hidden></p>
      <button class="btn btn-sm" type="submit">${icon('upload', 18)}Upload</button>
    </form></section></aside></div>` }));

onClick('download-res', (el) => {
  const r = S.resources.find((x) => x.id === el.dataset.id); if (!r) return;
  if (r.topic) { downloadFile(`${r.topic}-notes.txt`, notesAsText(r.topic)); toast('Downloaded'); }
  else if (FILES[r.id]) { downloadFile(FILES[r.id].name, null, FILES[r.id].url); toast('Downloaded'); }
  else toast('This file was uploaded in an earlier visit, so only its name was kept.');
});
onSubmit('upload', (form, f) => {
  const file = form.elements.file.files[0]; const title = f.val('title'), subject = f.val('subject');
  if (!file) return f.fail('Choose a file to upload.', 'file');
  if (!title) return f.fail('Give it a title.', 'title');
  const id = 'r' + uid(); FILES[id] = { name: file.name, url: URL.createObjectURL(file) };
  S.resources.push({ id, title, subject, kind: f.val('kind'), author: me().username, t: now(), fileName: file.name });
  addReputation(REPUTATION.contribution, subject); my().contrib++; award('contributor');
  logActivity(`Shared "${title}"`, '#/app/resources'); save(); toast('Uploaded'); refresh();
});

onClick('share-link', (el) => shareLink(el.dataset.href, el.dataset.title));
