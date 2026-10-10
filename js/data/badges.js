/** Badges students can earn. They reward useful behaviour, not time spent. */
export const BADGES = [
  { id: 'first-answer', name: 'First steps', desc: 'Answered your first question', color: '#FFC845' },
  { id: 'gap-fixer', name: 'Gap fixer', desc: 'Fixed a gap and passed the test again', color: '#F7A1C4' },
  { id: 'master', name: 'Topic master', desc: 'Mastered your first topic', color: '#10DC85' },
  { id: 'helper', name: 'Helper', desc: 'Answered someone\u2019s question', color: '#9EB0FF' },
  { id: 'contributor', name: 'Contributor', desc: 'Shared notes, an explanation or a resource', color: '#FFB08F' },
  { id: 'buddy', name: 'Study buddy', desc: 'Joined a study session', color: '#B9A7F5' },
  { id: 'host', name: 'Host', desc: 'Started a study session', color: '#7FE0C4' },
];

/** Reputation points. Shown to students on the Community page. */
export const REPUTATION = {
  upvote: 1,
  answer: 2,
  contribution: 5,
  hostSession: 5,
  accepted: 15,
  knownForThreshold: 30,
};
