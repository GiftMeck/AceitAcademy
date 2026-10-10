/** Community: posts, votes, reactions, answers, reputation. */
import { $, esc, uid, plural, paragraphs } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { now, ago, HOUR } from '../lib/time.js';
import { shareLink } from '../lib/share.js';
import { SUBJECTS, getSubject } from '../data/subjects.js';
import { REPUTATION } from '../data/badges.js';
import { S, me, my, save, addReputation, logActivity, award } from '../state.js';
import { addRoute, go, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { openModal, closeOverlay, toast } from '../ui/overlay.js';
import { flair, avatar, knownTag, illustration, crumbs } from '../ui/components.js';
import { dbCreatePost, dbCreateComment } from '../lib/supabase.js';

export const POST_TYPES = { question: 'Question', explanation: 'Explanation', notes: 'Notes', solution: 'Worked solution', video: 'Video', invite: 'Study session' };
const REP_RULES = [
  ['Your answer gets an upvote', REPUTATION.upvote], ['You answer a question', REPUTATION.answer],
  ['You share notes, an explanation or a resource', REPUTATION.contribution], ['You start a study session', REPUTATION.hostSession],
  ['Your answer is accepted', REPUTATION.accepted]];
const filters = { subject: 'all', sort: 'hot', saved: false };

/** Popular = score, cooled down by age. */
export const hot = (p) => (p.score + 1) / Math.pow((now() - p.t) / HOUR + 2, 1.2);
const myVote = (key) => my().votes[key] || 0;

function voteBox(key, score, own, label) {
  const v = myVote(key);
  return `<div class="votes" role="group" aria-label="Votes for ${esc(label)}">
    <button class="vote up${v === 1 ? ' on' : ''}" type="button" data-act="vote" data-key="${key}" data-dir="1" aria-pressed="${v === 1}" aria-label="Upvote" ${own ? 'disabled' : ''}>${icon('up', 18)}</button>
    <b aria-label="Score ${score + v}">${score + v}</b>
    <button class="vote down${v === -1 ? ' on' : ''}" type="button" data-act="vote" data-key="${key}" data-dir="-1" aria-pressed="${v === -1}" aria-label="Downvote" ${own ? 'disabled' : ''}>${icon('down', 18)}</button></div>`;
}
function reactions(p) {
  return Object.keys(p.reactions).map((e) => {
    const on = Boolean(my().reactions[p.id + e]); const n = p.reactions[e] + (on ? 1 : 0);
    return `<button class="react${on ? ' on' : ''}" type="button" data-act="react" data-id="${p.id}" data-e="${e}" aria-pressed="${on}" aria-label="React ${e}, ${n}">${e} ${n || ''}</button>`;
  }).join('');
}

/** A post in a list. compact = no preview text or reactions. */
export function postCard(p, compact) {
  const own = p.author === me().username; const saved = my().saved.includes(p.id);
  return `<article class="post">
    ${voteBox('p:' + p.id, p.score, own, p.title)}
    <div style="min-width:0">
      <div class="post-meta">${flair(p.subject)}<span class="tag">${POST_TYPES[p.type]}</span>${p.acceptedId ? `<span class="accepted-tag">${icon('check', 14)}Answered</span>` : ''}</div>
      <h3><a href="#/app/post/${p.id}">${esc(p.title)}</a></h3>
      ${compact ? '' : `<p class="snippet">${esc(p.body)}</p>`}
      <div class="post-meta" style="margin-bottom:6px">${avatar(p.author, 'sm')}<span class="author">${esc(own ? 'You' : p.author)}</span>${knownTag(p.author)}<span>${ago(p.t)}</span></div>
      <div class="post-actions">
        <a class="pa" href="#/app/post/${p.id}">${icon('comment', 18)}${p.comments.length}<span class="sr-only"> comments</span></a>
        ${compact ? '' : reactions(p)}
        <button class="pa" type="button" data-act="share" data-id="${p.id}" aria-label="Share">${icon('share', 18)}</button>
        <button class="pa${saved ? ' on' : ''}" type="button" data-act="save-post" data-id="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Saved' : 'Save'}">${icon('bookmark', 18)}</button>
      </div>
    </div></article>`;
}

function topHelpers() {
  const list = Object.entries(S.users).map(([h, u]) => ({ h, rep: u.rep }));
  list.push({ h: me().username, rep: my().rep });
  return list.sort((x, y) => y.rep - x.rep).slice(0, 5);
}

addRoute('/app/community', 'app', () => {
  const d = my();
  const list = S.posts.filter((p) => (filters.subject === 'all' || p.subject === filters.subject) && (!filters.saved || d.saved.includes(p.id)));
  const score = (p) => p.score + myVote('p:' + p.id);
  list.sort((x, y) => (filters.sort === 'new' ? y.t - x.t : filters.sort === 'top' ? score(y) - score(x) : hot(y) - hot(x)));
  const pressed = (on) => `aria-pressed="${on}"`;
  return { title: 'Community', nav: 'community', html: `
  <section class="feature-head"><div><h1>You are learning, but you are not learning alone.</h1>
    <p>Ask questions, share explanations and worked solutions, and upvote what helps.</p>
    <div class="actions"><button class="btn btn-sm" type="button" data-act="compose">${icon('plus', 18)}New post</button><button class="btn-quiet" type="button" data-act="new-session">Start a study session</button></div></div>
    </section>
  <div class="grid-rail"><div>
    <div class="toolbar"><div class="chips" role="group" aria-label="Filter by subject">
      <button type="button" data-act="filter-subject" data-v="all" ${pressed(filters.subject === 'all')}>All</button>
      ${SUBJECTS.map((s) => `<button type="button" data-act="filter-subject" data-v="${s.id}" ${pressed(filters.subject === s.id)}>${s.name}</button>`).join('')}</div></div>
    <div class="toolbar">
      <div class="seg" role="group" aria-label="Sort">${[['hot', 'Popular'], ['new', 'New'], ['top', 'Top']].map(([v, l]) => `<button type="button" data-act="sort" data-v="${v}" ${pressed(filters.sort === v)}>${l}</button>`).join('')}</div>
      <button class="btn-quiet${filters.saved ? ' on' : ''}" type="button" data-act="show-saved" ${pressed(filters.saved)}>${icon('bookmark', 18)}Saved</button>
    </div>
    ${list.map((p) => postCard(p)).join('') || `<div class="card empty"><h3>${filters.saved ? 'Nothing saved yet.' : 'No posts here yet.'}</h3><p>${filters.saved ? 'Tap the bookmark on any post to keep it here.' : 'Be the first to ask or explain something.'}</p></div>`}
  </div>
  <aside class="rail">
    <section class="card"><h2>Helpful students</h2><ul class="list">${topHelpers().map((u) => `<li class="row">${avatar(u.h)}<div class="grow"><span class="title">${esc(u.h === me().username ? 'You' : u.h)}</span>${knownTag(u.h) || '<span class="muted small">Getting started</span>'}</div><b>${u.rep}</b></li>`).join('')}</ul></section>
    <section class="card"><h2>How reputation works</h2><ul class="list">${REP_RULES.map(([k, v]) => `<li class="row small"><span class="grow">${k}</span><b>+${v}</b></li>`).join('')}</ul>
      <p class="muted small" style="margin:10px 0 0">Earn ${REPUTATION.knownForThreshold} points in one subject and other students will see you as known for it.</p></section>
  </aside></div>` };
});

addRoute('/app/post/:id', 'app', (id) => {
  const p = S.posts.find((x) => x.id === id); if (!p) { go('#/app/community', true); return null; }
  const a = me(); const own = p.author === a.username; const saved = my().saved.includes(p.id);
  const isQuestion = p.type === 'question';
  const comments = [...p.comments].sort((x, y) => (y.id === p.acceptedId) - (x.id === p.acceptedId) || (y.score + myVote('c:' + y.id)) - (x.score + myVote('c:' + x.id)));
  const session = p.sessionId && S.sessions.find((s) => s.id === p.sessionId);
  return { title: p.title, nav: 'community', html: `
  ${crumbs([['Community', '#/app/community']])}
  <div class="grid-rail"><div>
  <article class="post" style="padding:20px 18px 14px 12px">
    ${voteBox('p:' + p.id, p.score, own, p.title)}
    <div style="min-width:0">
      <div class="post-meta">${flair(p.subject)}<span class="tag">${POST_TYPES[p.type]}</span></div>
      <h1 style="font-size:clamp(1.4rem,3vw,1.9rem);line-height:1.2;margin:10px 0">${esc(p.title)}</h1>
      <div class="post-meta" style="margin-bottom:12px">${avatar(p.author, 'sm')}<span class="author">${esc(own ? 'You' : p.author)}</span>${knownTag(p.author)}<span>${ago(p.t)}</span></div>
      <div class="post-body">${paragraphs(p.body)}</div>
      ${p.url ? `<p><a class="link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Watch the video</a></p>` : ''}
      ${session ? `<p><a class="btn btn-sm" href="#/app/session/${session.id}">Open the study session</a></p>` : ''}
      <div class="post-actions">${reactions(p)}
        <button class="pa" type="button" data-act="share" data-id="${p.id}">${icon('share', 18)}Share</button>
        <button class="pa${saved ? ' on' : ''}" type="button" data-act="save-post" data-id="${p.id}" aria-pressed="${saved}">${icon('bookmark', 18)}${saved ? 'Saved' : 'Save'}</button></div>
    </div>
  </article>
  <section class="card" style="margin-top:14px" aria-labelledby="answers-h">
    <h2 id="answers-h">${plural(p.comments.length, isQuestion ? 'answer' : 'comment')}</h2>
    ${comments.map((c) => { const mine = c.author === a.username; const accepted = c.id === p.acceptedId;
      return `<div class="answer${accepted ? ' accepted' : ''}">${voteBox('c:' + c.id, c.score, mine, 'answer by ' + c.author)}<div style="min-width:0">
        <div class="post-meta" style="margin-bottom:6px">${avatar(c.author, 'sm')}<span class="author">${esc(mine ? 'You' : c.author)}</span>${knownTag(c.author)}<span>${ago(c.t)}</span>${accepted ? `<span class="accepted-tag">${icon('check', 14)}Accepted answer</span>` : ''}</div>
        <div class="post-body">${paragraphs(c.body)}</div>
        ${own && isQuestion && !mine && !accepted ? `<button class="btn-quiet" type="button" data-act="accept" data-post="${p.id}" data-id="${c.id}">${icon('check', 16)}Accept this answer</button>` : ''}
      </div></div>`; }).join('') || `<p class="muted">${isQuestion ? 'No answers yet. You could be the first.' : 'No comments yet.'}</p>`}
    <form data-form="comment" data-post="${p.id}" style="margin-top:14px">
      <div class="field"><label for="cm">${isQuestion ? 'Your answer' : 'Add a comment'}</label><textarea class="input" id="cm" name="body" required placeholder="${isQuestion ? 'Explain it the way you wish someone had explained it to you.' : 'Say something helpful.'}"></textarea></div>
      <p class="err" data-err hidden></p>
      <button class="btn btn-sm" type="submit">${isQuestion ? 'Post answer' : 'Post comment'}</button>
    </form>
  </section></div>
  <aside class="rail"><section class="card"><h2>More in ${esc(getSubject(p.subject).name)}</h2><ul class="list">${S.posts.filter((x) => x.subject === p.subject && x.id !== p.id).slice(0, 4).map((x) => `<li class="row"><a class="title small" href="#/app/post/${x.id}">${esc(x.title)}</a></li>`).join('') || '<li class="muted small">Nothing else yet.</li>'}</ul></section></aside>
  </div>` };
});

/* ---------- New post ---------- */
function composer(pre = {}) {
  openModal('New post', `<form data-form="compose" novalidate>
    <div class="field"><label for="cp-type">What are you sharing?</label><select class="input" id="cp-type" name="type">
      ${['question', 'explanation', 'notes', 'solution', 'video'].map((t) => `<option value="${t}">${POST_TYPES[t]}</option>`).join('')}</select></div>
    <div class="field"><label for="cp-sub">Subject</label><select class="input" id="cp-sub" name="subject">${SUBJECTS.map((s) => `<option value="${s.id}" ${pre.subject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
    <div class="field"><label for="cp-title">Title</label><input class="input" id="cp-title" name="title" required value="${esc(pre.title || '')}" placeholder="Be specific, e.g. Why does the sign flip here?"></div>
    <div class="field"><label for="cp-body">Details</label><textarea class="input" id="cp-body" name="body" required placeholder="Share what you tried and where you got stuck."></textarea></div>
    <div class="field" data-video hidden><label for="cp-url">Video link</label><input class="input" id="cp-url" name="url" type="url" placeholder="https://"></div>
    <p class="err" data-err hidden></p>
    <div class="actions"><button class="btn" type="submit">Post</button><button class="btn-quiet" type="button" data-act="close">Cancel</button></div>
  </form>`, { after: () => {
    const type = $('#cp-type'); const sync = () => { $('[data-video]').hidden = type.value !== 'video'; };
    type.addEventListener('change', sync); sync(); if (pre.title) $('#cp-body').focus();
  } });
}
onClick('compose', (el) => { closeOverlay(true); composer({ subject: el.dataset.subject, title: el.dataset.title }); });

onSubmit('compose', (form, f) => {
  const type = f.val('type'), subject = f.val('subject'), title = f.val('title'), body = f.val('body'), url = f.val('url');
  if (title.length < 6) return f.fail('Give your post a clear title.', 'title');
  if (body.length < 10) return f.fail('Add a bit more detail so people can help.', 'body');
  if (type === 'video' && !/^https?:\/\//.test(url)) return f.fail('Add a link to the video.', 'url');
  const post = { id: 'u' + uid(), type, subject, author: me().username, t: now(), score: 0, title, body, url: type === 'video' ? url : '', reactions: { '👍': 0, '💡': 0, '🔥': 0 }, comments: [] };
  S.posts.unshift(post);
  dbCreatePost({ subjectId: subject, title, body }).then((res) => {
    if (res?.id) post.id = res.id;
  });
  if (type !== 'question') { addReputation(REPUTATION.contribution, subject); my().contrib++; award('contributor'); }
  logActivity(`Posted "${title}"`, `#/app/post/${post.id}`); save(); closeOverlay(true); go('#/app/post/' + post.id); toast('Posted');
});

onSubmit('comment', (form, f) => {
  const p = S.posts.find((x) => x.id === form.dataset.post); const body = f.val('body');
  if (body.length < 2) return f.fail('Write something first.', 'body');
  const comment = { id: 'c' + uid(), author: me().username, t: now(), score: 0, body };
  p.comments.push(comment);
  dbCreateComment({ postId: p.id, body }).then((res) => {
    if (res?.id) comment.id = res.id;
  });
  if (p.author !== me().username) { addReputation(REPUTATION.answer, p.subject); if (p.type === 'question') award('helper'); }
  logActivity(`${p.type === 'question' ? 'Answered' : 'Commented on'} "${p.title}"`, `#/app/post/${p.id}`);
  save(); toast(p.type === 'question' ? 'Answer posted' : 'Comment posted'); refresh();
});

/* ---------- Voting, reacting, saving, sharing ---------- */
function findComment(cid) { for (const p of S.posts) { const c = p.comments.find((x) => x.id === cid); if (c) return c; } return null; }
onClick('vote', (el) => {
  const key = el.dataset.key; const dir = +el.dataset.dir; const d = my();
  const before = d.votes[key] || 0; const after = before === dir ? 0 : dir; d.votes[key] = after;
  const item = key.startsWith('p:') ? S.posts.find((x) => x.id === key.slice(2)) : findComment(key.slice(2));
  if (item && S.users[item.author]) S.users[item.author].rep = Math.max(0, S.users[item.author].rep + (after - before) * REPUTATION.upvote);
  save(); refresh();
});
onClick('react', (el) => { const k = el.dataset.id + el.dataset.e; my().reactions[k] = !my().reactions[k]; save(); refresh(); });
onClick('save-post', (el) => {
  const list = my().saved; const i = list.indexOf(el.dataset.id);
  if (i > -1) list.splice(i, 1); else list.push(el.dataset.id);
  save(); toast(i > -1 ? 'Removed from saved' : 'Saved'); refresh();
});
onClick('share', (el) => { const p = S.posts.find((x) => x.id === el.dataset.id); shareLink('#/app/post/' + el.dataset.id, p ? p.title : 'aceitacademy'); });
onClick('accept', (el) => {
  const p = S.posts.find((x) => x.id === el.dataset.post); if (!p) return;
  p.acceptedId = el.dataset.id;
  const c = p.comments.find((x) => x.id === el.dataset.id);
  if (c && S.users[c.author]) S.users[c.author].rep += REPUTATION.accepted;
  logActivity(`Accepted an answer on "${p.title}"`, `#/app/post/${p.id}`); save(); toast('Answer accepted'); refresh();
});
onClick('filter-subject', (el) => { filters.subject = el.dataset.v; refresh(); });
onClick('sort', (el) => { filters.sort = el.dataset.v; refresh(); });
onClick('show-saved', () => { filters.saved = !filters.saved; refresh(); });
