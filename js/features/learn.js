/** Subjects, topic lists and the notes reader (with the 20-minute nudge). */
import { $, esc, plural } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { downloadFile } from '../lib/share.js';
import { SUBJECTS, CURRICULA, getSubject, getTopic, curriculumName } from '../data/subjects.js';
import { TOPICS, hasNotes } from '../data/topics.js';
import { S, me, my, save, logActivity } from '../state.js';
import { addRoute, go, refresh, keepTimer } from '../router.js';
import { onClick } from '../ui/events.js';
import { openModal, toast, overlayOpen } from '../ui/overlay.js';
import { loopBar, crumbs, illustration } from '../ui/components.js';
import { masteredTopics, mySubjects, topicsWithNotes, statusTag, topicAction, progressOf } from './progress.js';

addRoute('/app/subjects', 'app', () => {
  const a = me(); const mine = mySubjects();
  const order = [...mine, ...SUBJECTS.map((s) => s.id).filter((id) => !mine.includes(id))];
  return { title: 'Subjects', nav: 'subjects', html: `
  <div class="page-h"><div><h1>Subjects</h1><p>Pick a subject, then a topic. Notes first, then questions.</p></div>
    <div class="seg" role="group" aria-label="Syllabus">${CURRICULA.map((c) => `<button type="button" data-act="set-curriculum" data-v="${c.id}" aria-pressed="${a.curriculum === c.id}">${c.name}</button>`).join('')}</div></div>
  <div class="subject-grid">${order.map((sid) => {
    const s = getSubject(sid); const ready = topicsWithNotes(sid); const done = ready.filter((t) => masteredTopics().includes(t.id)).length;
    return `<a class="subject-card" href="#/app/subjects/${sid}" style="--c:${s.color}"><h3>${esc(s.name)}</h3>
      <span class="muted small">${plural(s.topics.length, 'topic')}${ready.length ? `, notes ready for ${ready.length}` : ', notes coming soon'}</span>
      <div class="progress"><i style="width:${ready.length ? (done / ready.length) * 100 : 0}%;background:${s.color}"></i></div>
      <span class="small" style="font-weight:700">${mine.includes(sid) ? 'Your subject' : '&nbsp;'}</span></a>`;
  }).join('')}</div>` };
});

addRoute('/app/subjects/:id', 'app', (sid) => {
  const s = getSubject(sid); if (!s) { go('#/app/subjects', true); return null; }
  return { title: s.name, nav: 'subjects', html: `
  ${crumbs([['Subjects', '#/app/subjects'], [s.name]])}
  <div class="page-h"><div><h1>${esc(s.name)}</h1><p>${esc(curriculumName(me().curriculum))}</p></div></div>
  <section class="card"><ul class="list">${s.topics.map((t) => `<li class="topic-row"><div><span class="title">${esc(t.name)}</span><div style="margin-top:6px">${statusTag(t.id)}${hasNotes(t.id) ? ` <span class="muted small">About ${TOPICS[t.id].minutes} min of notes</span>` : ''}</div></div>
    <div>${topicAction(t.id, hasNotes(t.id) && !progressOf(t.id) ? 'btn btn-sm' : 'btn-quiet')}</div></li>`).join('')}</ul></section>
  <p class="muted small" style="margin-top:16px">Can\u2019t find your topic yet? <button class="link" type="button" data-act="compose" data-subject="${sid}">Ask the community</button></p>` };
});

addRoute('/app/learn/:id', 'app', (tid) => {
  const t = getTopic(tid); if (!t) { go('#/app/subjects', true); return null; }
  if (!hasNotes(tid)) return { title: t.name, nav: 'subjects', html: `
    ${crumbs([['Subjects', '#/app/subjects'], [t.subject.name, `#/app/subjects/${t.subject.id}`]])}
    <div class="card empty">${illustration('help')}<h1 style="font-size:1.4rem">Notes for ${esc(t.name)} are on the way.</h1><p>Until then, the community can help.</p>
    <div class="actions" style="justify-content:center"><button class="btn btn-sm" type="button" data-act="compose" data-subject="${t.subject.id}" data-title="Question about ${esc(t.name)}">Ask the community</button><a class="btn-quiet" href="#/app/study">Find a study session</a></div></div>` };

  const T = TOPICS[tid]; const d = my();
  if (!d.progress[tid]) { d.progress[tid] = { status: 'reading', gaps: [], wrong: {}, attempts: 0 }; logActivity(`Started learning ${t.name}`, `#/app/learn/${tid}`); save(); }
  const saved = d.savedNotes.includes(tid);
  return { title: t.name, nav: 'subjects', after: () => startReadingTimer(tid), html: `
  ${crumbs([['Subjects', '#/app/subjects'], [t.subject.name, `#/app/subjects/${t.subject.id}`], [t.name]])}
  <div class="reader">
    ${loopBar(0)}
    <div class="page-h" style="margin-bottom:10px"><h1>${esc(t.name)}</h1><span class="timer" id="timer">${icon('clock', 16)}<span>Reading 0:00</span></span></div>
    <p class="intro">${esc(T.intro)}</p>
    <div class="actions" style="margin-bottom:10px">
      <button class="btn-quiet${saved ? ' on' : ''}" type="button" data-act="save-note" data-id="${tid}" aria-pressed="${saved}">${icon('bookmark', 18)}${saved ? 'Saved' : 'Save notes'}</button>
      <button class="btn-quiet" type="button" data-act="download-note" data-id="${tid}">${icon('download', 18)}Download</button>
      <button class="btn-quiet" type="button" data-act="compose" data-subject="${t.subject.id}" data-title="Question about ${esc(t.name)}">${icon('comment', 18)}Ask the community</button>
    </div>
    ${T.sections.map((s) => `<section><h2>${esc(s.h)}</h2>${s.b}</section>`).join('')}
    <div class="readbar"><b>Done reading? Test yourself.</b><button class="btn btn-sm" type="button" data-act="start-questions" data-id="${tid}">Questions now</button></div>
  </div>` };
});

/** Counts reading time and nudges towards questions after S.nudgeMin minutes. */
function startReadingTimer(tid) {
  const d = my(); let secs = d.read[tid] || 0; let nudged = secs >= S.nudgeMin * 60; let tick = 0;
  const label = $('#timer span');
  const paint = () => { if (label) label.textContent = `Reading ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`; };
  paint();
  keepTimer(setInterval(() => {
    if (document.hidden || overlayOpen()) return;
    secs++; d.read[tid] = secs; paint();
    if (++tick % 15 === 0) save();
    if (!nudged && secs >= S.nudgeMin * 60) {
      nudged = true;
      openModal('That\u2019s enough studying. Questions now.', `<p class="muted">You have been reading for ${S.nudgeMin} minutes. Answering questions is how you find out what actually stuck.</p>
        <div class="actions" style="margin-top:18px"><button class="btn" type="button" data-act="start-questions" data-id="${tid}">Start questions</button><button class="btn-quiet" type="button" data-act="close">Keep reading</button></div>`);
    }
  }, 1000));
}

/** Notes as a plain text file. */
export function notesAsText(tid) {
  const T = TOPICS[tid]; const t = getTopic(tid);
  const strip = (h) => h.replace(/<li>/g, '\n- ').replace(/<\/p>/g, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return `${t.name} (${t.subject.name})\naceitacademy notes\n\n${T.intro}\n\n` + T.sections.map((s) => `${s.h.toUpperCase()}\n${strip(s.b)}`).join('\n\n') + '\n\nNever study alone.\n';
}

onClick('set-curriculum', (el) => { me().curriculum = el.dataset.v; save(); toast(`Syllabus set to ${curriculumName(el.dataset.v)}`); refresh(); });
onClick('save-note', (el) => {
  const list = my().savedNotes; const i = list.indexOf(el.dataset.id);
  if (i > -1) list.splice(i, 1); else list.push(el.dataset.id);
  save(); toast(i > -1 ? 'Removed from saved notes' : 'Saved to your notes'); refresh();
});
onClick('download-note', (el) => { downloadFile(`${el.dataset.id}-notes.txt`, notesAsText(el.dataset.id)); toast('Notes downloaded'); });
