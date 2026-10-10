/** Home: the next useful action, progress and what's happening. */
import { esc, plural, joinWords } from '../lib/dom.js';
import { now, when, HOUR } from '../lib/time.js';
import { getSubject, getTopic, curriculumName } from '../data/subjects.js';
import { S, me, my } from '../state.js';
import { addRoute } from '../router.js';
import { nextAction, masteredTopics, mySubjects, topicsWithNotes, topicsWithGaps, skillNames } from './progress.js';
import { postCard, hot } from './community.js';

addRoute('/app/home', 'app', () => {
  const a = me(); const d = my(); const next = nextAction();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const upcoming = S.sessions.filter((s) => s.when > now() - 2 * HOUR).sort((x, y) => x.when - y.when);
  const mine = upcoming.filter((s) => s.members.includes(a.username));
  const sessions = (mine.length ? mine : upcoming).slice(0, 2);
  const posts = S.posts.filter((p) => mySubjects().includes(p.subject)).sort((x, y) => hot(y) - hot(x)).slice(0, 3);
  const gaps = topicsWithGaps();
  return { title: 'Home', nav: 'home', html: `
  <div class="page-h"><div><h1>${greeting}, ${esc(a.name.split(' ')[0])}.</h1><p>${esc(curriculumName(a.curriculum))}</p></div></div>
  <div class="grid-rail"><div class="stack">
    <section class="next" aria-labelledby="next-title">
      <svg class="deco-tri" viewBox="0 0 100 100" aria-hidden="true"><path d="M20,8 L96,36 L34,90 Z" fill="#FFC845"/></svg>
      <span class="eyebrow">Your next step</span><h2 id="next-title">${esc(next.title)}</h2><p>${esc(next.text)}</p>
      ${next.act ? `<button class="btn" type="button" ${next.act}>${next.cta}</button>` : `<a class="btn" href="${next.href}">${next.cta}</a>`}
    </section>
    <div class="stats">
      <div class="stat"><b>${d.answered}</b><span>questions answered</span></div>
      <div class="stat"><b>${masteredTopics().length}</b><span>topics mastered</span></div>
      <div class="stat"><b>${d.joined.length + d.hosted.length}</b><span>study sessions</span></div>
      <div class="stat"><b>${d.rep}</b><span>reputation</span></div>
    </div>
    <section class="card"><div class="card-h"><h2>Your subjects</h2><a class="link small" href="#/app/subjects">All subjects</a></div>
      <ul class="list">${mySubjects().map((sid) => {
        const s = getSubject(sid); const ready = topicsWithNotes(sid); const done = ready.filter((t) => masteredTopics().includes(t.id)).length;
        return `<li class="row"><div class="grow"><a class="title" href="#/app/subjects/${sid}">${esc(s.name)}</a><span class="muted small">${done} of ${plural(ready.length, 'available topic')} mastered</span>
        <div class="progress" style="margin-top:8px"><i style="width:${ready.length ? (done / ready.length) * 100 : 0}%;background:${s.color}"></i></div></div></li>`;
      }).join('')}</ul>
    </section>
    <section class="card"><div class="card-h"><h2>From the community</h2><a class="link small" href="#/app/community">Community</a></div>
      ${posts.map((p) => postCard(p, true)).join('') || '<p class="muted">Nothing here yet.</p>'}
    </section>
  </div>
  <aside class="rail" aria-label="Your week">
    <section class="card"><h2>Today\u2019s focus</h2>
      ${gaps.length ? `<ul class="list">${gaps.map(([tid, p]) => `<li class="row"><span class="grow"><span class="title">${esc(getTopic(tid).name)}</span><span class="muted small">${esc(joinWords(skillNames(tid, p.gaps)))}</span></span><a class="btn-quiet" href="#/app/fix/${tid}">Fix</a></li>`).join('')}</ul>`
        : '<p class="muted" style="margin:0">No gaps right now. Answer questions on a topic to find out what needs work.</p>'}
    </section>
    <section class="card"><div class="card-h"><h2>Study sessions</h2><a class="link small" href="#/app/study">All</a></div>
      <ul class="list">${sessions.map((s) => `<li class="row"><div class="grow"><a class="title" href="#/app/session/${s.id}">${esc(s.title)}</a><span class="muted small">${when(s.when)}</span></div></li>`).join('') || '<li class="muted">No sessions yet.</li>'}</ul>
    </section>
  </aside></div>` };
});
