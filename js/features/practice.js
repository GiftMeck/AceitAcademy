/**
 * The learning loop after the notes:
 * Questions -> Diagnose -> Fix -> Test again -> Master
 */
import { $, esc, plural, joinWords } from '../lib/dom.js';
import { now } from '../lib/time.js';
import { getTopic } from '../data/subjects.js';
import { TOPICS, hasNotes } from '../data/topics.js';
import { S, my, save, logActivity, notify, award } from '../state.js';
import { dbRecordAttempt, dbSaveMastery } from '../lib/supabase.js';
import { addRoute, go, route, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { closeOverlay } from '../ui/overlay.js';
import { loopBar, crumbs, flair } from '../ui/components.js';
import { progressOf, masteredTopics, topicsWithGaps, skillNames, mySubjects, topicsWithNotes, statusTag } from './progress.js';

let quiz = null;      // the question set in progress
let fix = null;       // which gap is being fixed
let lastResult = {};  // score of the last set, per topic
export function resetPractice() { quiz = null; fix = null; lastResult = {}; }

const findQuestion = (tid, qid) => TOPICS[tid].questions.find((q) => q.id === qid);
function questionsBySkill(tid) {
  const by = {};
  TOPICS[tid].questions.forEach((q) => { (by[q.skill] = by[q.skill] || []).push(q.id); });
  return by;
}

/** First two questions per skill for diagnosis; for a retest, fresh questions on the gap skills only. */
function questionSet(tid, mode, gapSkills = []) {
  const by = questionsBySkill(tid);
  if (mode === 'retest') {
    const wrong = (progressOf(tid) || {}).wrong || {};
    return gapSkills.flatMap((k) => { const ids = by[k]; return [ids[2], ids[0], ids[1]].filter((id) => id && id !== wrong[k]).slice(0, 2); });
  }
  return TOPICS[tid].questions.filter((q) => by[q.skill].indexOf(q.id) < 2).map((q) => q.id);
}

export function startQuiz(tid, mode = 'diag') {
  const p = progressOf(tid) || (my().progress[tid] = { status: 'reading', gaps: [], wrong: {}, attempts: 0 });
  quiz = { tid, mode, list: questionSet(tid, mode, p.gaps), i: 0, results: {} };
  closeOverlay(true);
  go(`#/app/practice/${tid}`);
}

/** Radio options, marked right/wrong once answered. */
function options(q, result) {
  return q.options.map((o, i) => {
    let cls = 'opt';
    if (result) { cls += ' locked'; if (o.ok) cls += ' right'; else if (result.choice === i) cls += ' wrong'; }
    return `<label class="${cls}"><input type="radio" name="choice" value="${i}" ${result && result.choice === i ? 'checked' : ''} ${result ? 'disabled' : ''}><span>${esc(o.t)}</span></label>`;
  }).join('');
}
function feedback(q, result, okTitle = 'Correct.', noTitle = 'Not quite.') {
  if (!result) return '';
  if (result.ok) return `<div class="feedback ok" role="status"><h3>${okTitle}</h3><p>${esc(q.explain)}</p></div>`;
  return `<div class="feedback no" role="status"><h3>${noTitle}</h3><p>${esc(q.options[result.choice].why || '')}</p><p><strong>The answer:</strong> ${esc(q.options.find((o) => o.ok).t)}. ${esc(q.explain)}</p></div>`;
}

/* ---------- Questions ---------- */
addRoute('/app/practice/:id', 'app', (tid) => {
  if (!hasNotes(tid)) { go('#/app/subjects', true); return null; }
  if (!quiz || quiz.tid !== tid) quiz = { tid, mode: 'diag', list: questionSet(tid, 'diag'), i: 0, results: {} };
  const t = getTopic(tid); const q = findQuestion(tid, quiz.list[quiz.i]); const r = quiz.results[q.id];
  const total = quiz.list.length; const done = quiz.i + (r ? 1 : 0); const label = quiz.mode === 'retest' ? 'Test again' : 'Questions';
  return { title: `${label}: ${t.name}`, nav: 'questions', after: () => { if (r) { const b = $('[data-act="next-question"]'); if (b) b.focus(); } }, html: `
  <div class="quiz">
    ${crumbs([[t.subject.name, `#/app/subjects/${t.subject.id}`], [t.name, `#/app/learn/${tid}`]])}
    ${loopBar(quiz.mode === 'retest' ? 4 : 1)}
    <h1 class="sr-only">${label}: ${esc(t.name)}</h1>
    <div class="q-top"><span>${label}, ${quiz.i + 1} of ${total}</span><span>${esc(TOPICS[tid].skills[q.skill].name)}</span></div>
    <div class="bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${(done / total) * 100}%"></i></div>
    <form class="q-card" data-form="answer">
      <fieldset><legend class="q-text">${esc(q.q)}</legend><div class="opts">${options(q, r)}</div></fieldset>
      <p class="err" data-err hidden style="margin:12px 0 0"></p>
      ${feedback(q, r)}
      <div class="q-actions">${r ? `<button class="btn" type="button" data-act="next-question">${quiz.i === total - 1 ? 'See results' : 'Next question'}</button>` : '<button class="btn" type="submit">Check answer</button>'}</div>
    </form>
  </div>` };
});

onSubmit('answer', (form, f) => {
  const choice = f.data.get('choice');
  if (choice === null) return f.fail('Choose an answer first.');
  const qid = quiz.list[quiz.i];
  const q = findQuestion(quiz.tid, qid);
  const ok = Boolean(q.options[+choice].ok);
  quiz.results[qid] = { choice: +choice, ok };
  const d = my(); d.answered++; if (ok) d.correct++;
  award('first-answer'); save(); refresh();

  dbRecordAttempt({
    questionId: qid,
    chosenOption: choice,
    isCorrect: ok,
    gapIdentified: !ok ? q.skill : null,
  });
});
onClick('next-question', () => { quiz.i++; if (quiz.i >= quiz.list.length) finishQuiz(); else route(); });
onClick('start-questions', (el) => startQuiz(el.dataset.id, 'diag'));
onClick('retest', (el) => startQuiz(el.dataset.id, 'retest'));

/** Work out which skills are solid and which are gaps. */
function finishQuiz() {
  const { tid, mode, list, results } = quiz; const t = getTopic(tid); const p = progressOf(tid);
  const skillOk = {};
  if (mode === 'diag') p.wrong = {};
  list.forEach((qid) => {
    const q = findQuestion(tid, qid);
    skillOk[q.skill] = skillOk[q.skill] !== false && results[qid].ok;
    if (!results[qid].ok && (mode === 'retest' || !p.wrong[q.skill])) p.wrong[q.skill] = qid;
  });
  p.attempts++;
  p.gaps = mode === 'diag' ? Object.keys(skillOk).filter((k) => !skillOk[k]) : p.gaps.filter((k) => skillOk[k] === false);
  const wasMastered = p.status === 'mastered';
  if (!p.gaps.length) {
    p.status = 'mastered'; p.masteredAt = now(); p.wrong = {};
    if (!wasMastered) {
      logActivity(`Mastered ${t.name}`, `#/app/learn/${tid}`); notify(`You mastered ${t.name}.`, '#/app/profile');
      award('master'); if (mode === 'retest') award('gap-fixer');
    }
  } else {
    p.status = 'gaps';
    logActivity(`Found gaps in ${t.name}: ${joinWords(skillNames(tid, p.gaps))}`, `#/app/fix/${tid}`);
  }
  lastResult[tid] = { correct: list.filter((qid) => results[qid].ok).length, total: list.length, skills: Object.keys(skillOk).map((k) => ({ k, ok: skillOk[k] })) };
  
  dbSaveMastery({
    topicId: tid,
    mastered: !p.gaps.length,
    gaps: p.gaps,
  });

  quiz = null; save();
  go(`#/app/results/${tid}`);
}

/* ---------- Results ---------- */
addRoute('/app/results/:id', 'app', (tid) => {
  if (!hasNotes(tid)) { go('#/app/subjects', true); return null; }
  const t = getTopic(tid); const p = progressOf(tid); const L = lastResult[tid]; const T = TOPICS[tid];
  if (!p || (!L && p.status === 'reading')) { go(`#/app/learn/${tid}`, true); return null; }
  const d = my();
  if (p.status === 'mastered') {
    const next = mySubjects().flatMap(topicsWithNotes).find((x) => !masteredTopics().includes(x.id));
    return { title: `${t.name} mastered`, nav: 'questions', html: `
    <div class="quiz">${loopBar(5)}
    <section class="result-hero win"><span class="tag good">Mastered</span><h1>${esc(t.name)} mastered.</h1>
      <p class="muted">${L ? `${L.correct} of ${L.total} correct. ` : ''}${plural(d.answered, 'question')} answered, ${plural(masteredTopics().length, 'topic')} mastered.</p>
      <ul class="skill-list">${Object.values(T.skills).map((s) => `<li>${esc(s.name)}<span class="tag good">Solid</span></li>`).join('')}</ul>
      <div class="actions" style="margin-top:20px">${next ? `<a class="btn" href="#/app/learn/${next.id}">Next topic: ${esc(next.name)}</a>` : '<a class="btn" href="#/app/community">Help someone in the community</a>'}<a class="btn-quiet" href="#/app/subjects/${t.subject.id}">Back to ${esc(t.subject.name)}</a></div>
    </section></div>` };
  }
  const names = skillNames(tid, p.gaps);
  const skills = L ? L.skills : Object.keys(T.skills).map((k) => ({ k, ok: !p.gaps.includes(k) }));
  return { title: `Results: ${t.name}`, nav: 'questions', html: `
    <div class="quiz">${loopBar(2)}
    <section class="result-hero">${L ? `<span class="tag">${L.correct} of ${L.total} correct</span>` : ''}
      <h1>You struggled with ${esc(joinWords(names))}. Let\u2019s fix that.</h1>
      <p class="muted">Every wrong answer points at a specific idea. Fix those, then test again.</p>
      <ul class="skill-list">${skills.map((s) => `<li>${esc(T.skills[s.k].name)}${s.ok ? '<span class="tag good">Solid</span>' : '<span class="tag gap">Gap</span>'}</li>`).join('')}</ul>
      <div class="actions" style="margin-top:20px"><a class="btn" href="#/app/fix/${tid}">Fix it</a><button class="btn-quiet" type="button" data-act="compose" data-subject="${t.subject.id}" data-title="Help with ${esc(names[0])} (${esc(t.name)})">Ask the community</button></div>
    </section></div>` };
});

/* ---------- Fix the gaps ---------- */
function gapQuestion(tid, skill) {
  const p = progressOf(tid);
  return findQuestion(tid, p.wrong[skill] || questionSet(tid, 'diag').find((id) => findQuestion(tid, id).skill === skill));
}

addRoute('/app/fix/:id', 'app', (tid) => {
  if (!hasNotes(tid)) { go('#/app/subjects', true); return null; }
  const t = getTopic(tid); const p = progressOf(tid); const T = TOPICS[tid];
  if (!p || p.status !== 'gaps' || !p.gaps.length) { go(`#/app/results/${tid}`, true); return null; }
  if (!fix || fix.tid !== tid || fix.i >= p.gaps.length) fix = { tid, i: 0, result: null };
  const skill = T.skills[p.gaps[fix.i]]; const q = gapQuestion(tid, p.gaps[fix.i]); const r = fix.result;
  const lastGap = fix.i === p.gaps.length - 1;
  return { title: `Fix: ${t.name}`, nav: 'questions', html: `
  <div class="quiz">
    ${crumbs([[t.subject.name, `#/app/subjects/${t.subject.id}`], [t.name, `#/app/learn/${tid}`]])}
    ${loopBar(3)}
    <div class="q-top"><span>Gap ${fix.i + 1} of ${p.gaps.length}</span></div>
    <section class="q-card"><h1 style="font-size:clamp(1.4rem,3vw,1.8rem);margin-bottom:10px">${esc(skill.name)}</h1>${skill.fix}<div class="eg">${skill.eg}</div></section>
    <form class="q-card" data-form="fix-answer">
      <fieldset><legend class="q-text">Try this one again. ${esc(q.q)}</legend><div class="opts">${options(q, r)}</div></fieldset>
      <p class="err" data-err hidden style="margin:12px 0 0"></p>
      ${feedback(q, r, 'That\u2019s it.', 'Not yet.')}
      <div class="q-actions">${r ? (lastGap ? `<button class="btn" type="button" data-act="retest" data-id="${tid}">Test again</button>` : '<button class="btn" type="button" data-act="next-gap">Next gap</button>') : '<button class="btn" type="submit">Check answer</button>'}</div>
    </form>
    <section class="card" style="margin-top:14px"><h2>Still stuck?</h2><p class="muted">Someone studying the same syllabus has probably been exactly here.</p>
      <div class="actions"><button class="btn-quiet" type="button" data-act="compose" data-subject="${t.subject.id}" data-title="Help with ${esc(skill.name.toLowerCase())} (${esc(t.name)})">Ask the community</button><a class="btn-quiet" href="#/app/study?subject=${t.subject.id}">Find a study session</a></div></section>
  </div>` };
});

onSubmit('fix-answer', (form, f) => {
  const choice = f.data.get('choice');
  if (choice === null) return f.fail('Choose an answer first.');
  const p = progressOf(fix.tid); const q = gapQuestion(fix.tid, p.gaps[fix.i]);
  fix.result = { choice: +choice, ok: Boolean(q.options[+choice].ok) };
  const d = my(); d.answered++; if (fix.result.ok) d.correct++;
  save(); refresh();
  const next = $('[data-act="next-gap"], [data-act="retest"]'); if (next) next.focus();
});
onClick('next-gap', () => { fix.i++; fix.result = null; route(); });

/* ---------- Questions hub ---------- */
addRoute('/app/questions', 'app', () => {
  const gaps = topicsWithGaps();
  const topics = mySubjects().flatMap((sid) => topicsWithNotes(sid).map((t) => ({ ...t, sid })));
  const waiting = S.posts.filter((p) => p.type === 'question' && !p.comments.length).slice(0, 4);
  return { title: 'Questions', nav: 'questions', html: `
  <div class="page-h"><div><h1>Questions</h1><p>Answering questions is how you find out what you actually know.</p></div></div>
  <div class="stack">
    <section class="card"><h2>Your gaps</h2>
      ${gaps.length ? `<ul class="list">${gaps.map(([tid, p]) => `<li class="row"><div class="grow"><span class="title">${esc(getTopic(tid).name)}</span><span class="muted small">${esc(joinWords(skillNames(tid, p.gaps)))}</span></div><a class="btn btn-sm" href="#/app/fix/${tid}">Fix it</a></li>`).join('')}</ul>`
        : '<p class="muted" style="margin:0">No gaps yet. Answer questions on a topic and aceitacademy will show you what needs work.</p>'}
    </section>
    <section class="card"><h2>Practise a topic</h2>
      <ul class="list">${topics.map((t) => `<li class="row"><div class="grow"><span class="title">${esc(t.name)}</span><span style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">${flair(t.sid)}${statusTag(t.id)}</span></div>
        <button class="btn-quiet" type="button" data-act="start-questions" data-id="${t.id}">${progressOf(t.id) && progressOf(t.id).status === 'mastered' ? 'Practise again' : 'Start questions'}</button></li>`).join('') || '<li class="muted">Add subjects in your profile to see topics here.</li>'}</ul>
    </section>
    <section class="card"><div class="card-h"><h2>Waiting for an answer</h2><a class="link small" href="#/app/community">Community</a></div>
      <p class="muted small" style="margin-top:-6px">Explaining something to someone else is one of the best ways to learn it.</p>
      <ul class="list">${waiting.map((p) => `<li class="row"><div class="grow"><a class="title" href="#/app/post/${p.id}">${esc(p.title)}</a><span style="display:flex;gap:8px;margin-top:4px">${flair(p.subject)}</span></div><a class="btn-quiet" href="#/app/post/${p.id}">Answer</a></li>`).join('') || '<li class="muted">Every question has an answer right now.</li>'}</ul>
    </section>
  </div>` };
});
