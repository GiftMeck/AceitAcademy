/** What a student has learned: topic status, gaps and what to do next. */
import { joinWords } from '../lib/dom.js';
import { SUBJECTS, getSubject, getTopic } from '../data/subjects.js';
import { TOPICS, hasNotes } from '../data/topics.js';
import { me, my } from '../state.js';

export const progressOf = (topicId) => my().progress[topicId];
export const masteredTopics = () => Object.entries(my().progress).filter(([, p]) => p.status === 'mastered').map(([k]) => k);
export const topicsWithGaps = () => Object.entries(my().progress).filter(([, p]) => p.status === 'gaps');
export const skillNames = (topicId, ids) => ids.map((k) => TOPICS[topicId].skills[k].name.toLowerCase());
export const mySubjects = () => { const a = me(); return a.subjects && a.subjects.length ? a.subjects : SUBJECTS.map((s) => s.id); };
export const topicsWithNotes = (subjectId) => getSubject(subjectId).topics.filter((t) => hasNotes(t.id));

export function statusTag(topicId) {
  const p = progressOf(topicId);
  if (!hasNotes(topicId)) return '<span class="tag">Notes coming soon</span>';
  if (!p) return '<span class="tag">Not started</span>';
  if (p.status === 'mastered') return '<span class="tag good">Mastered</span>';
  if (p.status === 'gaps') return '<span class="tag gap">Gaps to fix</span>';
  return '<span class="tag warn">In progress</span>';
}

export function topicAction(topicId, cls = 'btn-quiet') {
  const p = progressOf(topicId);
  if (!hasNotes(topicId)) return '';
  if (p && p.status === 'gaps') return `<a class="${cls}" href="#/app/fix/${topicId}">Fix gaps</a>`;
  if (p && p.status === 'mastered') return `<a class="${cls}" href="#/app/learn/${topicId}">Revise</a>`;
  return `<a class="${cls}" href="#/app/learn/${topicId}">${p ? 'Continue' : 'Start learning'}</a>`;
}

/** The single most useful thing to do next, shown on Home. */
export function nextAction() {
  const gap = topicsWithGaps()[0];
  if (gap) {
    const [tid, p] = gap; const t = getTopic(tid);
    return { title: `You struggled with ${t.name.toLowerCase()}. Let\u2019s fix that.`, text: `Gaps found in ${joinWords(skillNames(tid, p.gaps))}.`, href: `#/app/fix/${tid}`, cta: 'Fix it' };
  }
  const reading = Object.entries(my().progress).find(([, p]) => p.status === 'reading');
  if (reading) {
    const t = getTopic(reading[0]);
    return { title: `Questions now: ${t.name}.`, text: 'You have read the notes. Find out what stuck.', cta: 'Start questions', act: `data-act="start-questions" data-id="${reading[0]}"` };
  }
  for (const sid of mySubjects()) for (const t of topicsWithNotes(sid)) if (!my().progress[t.id]) {
    return { title: `Start learning: ${t.name}.`, text: `${getSubject(sid).name}. About ${TOPICS[t.id].minutes} minutes of notes, then questions.`, href: `#/app/learn/${t.id}`, cta: 'Start learning' };
  }
  return { title: 'Every available topic is mastered.', text: 'Help someone in the community while new topics are on the way.', href: '#/app/community', cta: 'Go to the community' };
}
