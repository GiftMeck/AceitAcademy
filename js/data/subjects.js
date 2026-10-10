/**
 * Subjects, topics and syllabuses.
 * To add a topic: add it to a subject's list here, then give it notes and
 * questions in topics.js. Topics without notes show "Notes coming soon".
 */
export const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', color: '#4F6BEF', soft: '#E7EBFD', topics: [
    { id: 'simultaneous-equations', name: 'Simultaneous equations' },
    { id: 'quadratic-equations', name: 'Quadratic equations' },
    { id: 'indices', name: 'Indices' },
    { id: 'trigonometry', name: 'Trigonometry' } ] },
  { id: 'biology', name: 'Biology', color: '#0E9F5B', soft: '#DDF6E9', topics: [
    { id: 'osmosis', name: 'Osmosis' },
    { id: 'photosynthesis', name: 'Photosynthesis' },
    { id: 'enzymes', name: 'Enzymes' },
    { id: 'human-nutrition', name: 'Human nutrition' } ] },
  { id: 'chemistry', name: 'Chemistry', color: '#D6457F', soft: '#FCE5EF', topics: [
    { id: 'rates-of-reaction', name: 'Rates of reaction' },
    { id: 'acids-bases-salts', name: 'Acids, bases and salts' },
    { id: 'atomic-structure', name: 'Atomic structure' },
    { id: 'the-mole', name: 'The mole' } ] },
  { id: 'physics', name: 'Physics', color: '#C98A00', soft: '#FFF3D6', topics: [
    { id: 'speed-velocity-acceleration', name: 'Speed, velocity and acceleration' },
    { id: 'forces', name: 'Forces and motion' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'waves', name: 'Waves' } ] },
  { id: 'english', name: 'English', color: '#7A5CE0', soft: '#EEE9FC', topics: [
    { id: 'summary-writing', name: 'Summary writing' },
    { id: 'comprehension', name: 'Comprehension' },
    { id: 'composition', name: 'Composition' } ] },
];

export const CURRICULA = [
  { id: 'msce', name: 'MSCE' },
  { id: 'igcse', name: 'Cambridge IGCSE' },
  { id: 'gcse', name: 'GCSE' },
];

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id);
export const curriculumName = (id) => (CURRICULA.find((c) => c.id === id) || {}).name || '';

/** Topic details plus the subject it belongs to. */
export function getTopic(topicId) {
  for (const s of SUBJECTS) {
    const t = s.topics.find((x) => x.id === topicId);
    if (t) return { ...t, subject: s };
  }
  return null;
}
