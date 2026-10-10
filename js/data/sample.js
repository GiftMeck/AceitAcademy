/**
 * SAMPLE COMMUNITY. These students, posts and sessions are made up so the
 * community doesn't look empty while you test. Remove or replace them before launch.
 */
import { now, at, MIN, HOUR, DAY } from '../lib/time.js';

export function sampleCommunity() {
  const users = {
    'kondwani07': { name: 'Kondwani', place: 'Mzuzu', cur: 'msce', rep: 412, known: ['mathematics'] },
    'tadala.m': { name: 'Tadala', place: 'Lilongwe', cur: 'msce', rep: 356, known: ['chemistry'] },
    'thoko_bio': { name: 'Thoko', place: 'Blantyre', cur: 'igcse', rep: 288, known: ['biology'] },
    'amara_gcse': { name: 'Amara', place: 'Birmingham', cur: 'gcse', rep: 203, known: ['physics'] },
    'chikondi_k': { name: 'Chikondi', place: 'Zomba', cur: 'msce', rep: 64, known: [] },
    'mphatso': { name: 'Mphatso', place: 'Lilongwe', cur: 'msce', rep: 41, known: [] },
  };
  const t = now();
  const posts = [
    { id: 'p1', type: 'question', subject: 'mathematics', author: 'chikondi_k', t: t - 3 * HOUR, score: 24,
      title: 'How do I know when to add or subtract in elimination?',
      body: 'Every time I do simultaneous equations I end up with a letter that won\u2019t disappear. Is there a rule for when to add and when to subtract?',
      reactions: { '👍': 9, '💡': 3, '🔥': 0 },
      comments: [
        { id: 'c1', author: 'kondwani07', t: t - 2 * HOUR, score: 31, body: 'Look only at the letter you want to remove.\n\nSame signs (both + or both −): subtract.\nDifferent signs: add.\n\nIf the numbers in front don\u2019t match yet, multiply the whole equation first, every term.' },
        { id: 'c2', author: 'mphatso', t: t - 90 * MIN, score: 6, body: 'I remember it as SSS: Same Signs Subtract.' } ],
      acceptedId: 'c1' },
    { id: 'p2', type: 'explanation', subject: 'chemistry', author: 'tadala.m', t: t - 20 * HOUR, score: 48,
      title: 'Rates of reaction explained with Limbe depot',
      body: 'Picture Limbe depot on a hot afternoon. Everyone is rushing, so people bump into each other more often, and more of those bumps are hard enough to really shove someone.\n\nParticles work the same way. Heat them up and they collide more often AND more collisions have at least the activation energy. In the exam, give both reasons.',
      reactions: { '👍': 21, '💡': 17, '🔥': 8 },
      comments: [ { id: 'c3', author: 'chikondi_k', t: t - 18 * HOUR, score: 5, body: 'The depot thing makes so much sense now. Thank you!' } ] },
    { id: 'p3', type: 'question', subject: 'biology', author: 'mphatso', t: t - 26 * HOUR, score: 15,
      title: 'Why don\u2019t plant cells burst in pure water when red blood cells do?',
      body: 'Both take in water by osmosis, so why is the result so different?',
      reactions: { '👍': 6, '💡': 2, '🔥': 0 },
      comments: [ { id: 'c4', author: 'thoko_bio', t: t - 25 * HOUR, score: 19, body: 'Plant cells have a cell wall. Water still comes in, but the wall pushes back, so the cell becomes turgid instead of bursting.\n\nRed blood cells are animal cells with no wall, so nothing stops them swelling until they burst.' } ],
      acceptedId: 'c4' },
    { id: 'p4', type: 'solution', subject: 'physics', author: 'amara_gcse', t: t - 2 * DAY, score: 33,
      title: 'Worked solution: a bus slowing down',
      body: 'A bus slows from 15 m/s to 5 m/s in 5 s. Find its acceleration.\n\na = (v − u) ÷ t\na = (5 − 15) ÷ 5\na = −10 ÷ 5 = −2 m/s²\n\nThe minus sign tells you it is decelerating. Examiners look for it.',
      reactions: { '👍': 14, '💡': 9, '🔥': 2 }, comments: [] },
    { id: 'p5', type: 'notes', subject: 'biology', author: 'thoko_bio', t: t - 3 * DAY, score: 40,
      title: 'One-page summary: osmosis',
      body: 'Water moves from dilute to concentrated, through a partially permeable membrane.\n\nPlant cells: in = turgid, out = flaccid, then plasmolysed.\nAnimal cells: in = swell and burst, out = shrink.\n\nPotato strips: percentage change = change ÷ start mass × 100.',
      reactions: { '👍': 25, '💡': 11, '🔥': 4 }, comments: [] },
    { id: 'p6', type: 'question', subject: 'physics', author: 'chikondi_k', t: t - 5 * HOUR, score: 7,
      title: 'Is velocity just speed with a fancy name?',
      body: 'My teacher keeps correcting me when I say speed instead of velocity. What is actually different?',
      reactions: { '👍': 3, '💡': 0, '🔥': 0 }, comments: [] },
    { id: 'p7', type: 'question', subject: 'chemistry', author: 'mphatso', t: t - 7 * HOUR, score: 5,
      title: 'Does a catalyst get used up in a reaction?',
      body: 'If it takes part in the reaction, how can it still be there at the end?',
      reactions: { '👍': 2, '💡': 0, '🔥': 0 }, comments: [] },
    { id: 'p8', type: 'invite', subject: 'mathematics', author: 'kondwani07', t: t - 4 * HOUR, score: 12, sessionId: 's1',
      title: 'Simultaneous equations session tonight',
      body: 'Bring one question you are stuck on. We will finish with ten minutes of past-paper style questions.',
      reactions: { '👍': 8, '💡': 0, '🔥': 5 }, comments: [] },
  ];
  const sessions = [
    { id: 's1', title: 'Simultaneous equations sprint', subject: 'mathematics', topic: 'simultaneous-equations', cur: 'msce', when: at(0, 19), host: 'kondwani07', members: ['kondwani07', 'chikondi_k', 'mphatso', 'tadala.m'], invited: [], cap: 10,
      messages: [ { author: 'kondwani07', body: 'We start at 19:00. Bring one question each!', t: t - 3 * HOUR } ], questions: [ { author: 'chikondi_k', body: 'When do I multiply both equations instead of just one?', t: t - 2 * HOUR } ], resources: [] },
    { id: 's2', title: 'Osmosis past-paper practice', subject: 'biology', topic: 'osmosis', cur: 'igcse', when: at(1, 16), host: 'thoko_bio', members: ['thoko_bio', 'amara_gcse'], invited: [], cap: 8,
      messages: [ { author: 'thoko_bio', body: 'We\u2019ll focus on the potato strip questions.', t: t - DAY } ], questions: [], resources: [ { author: 'thoko_bio', title: 'One-page summary: osmosis', post: 'p5', t: t - DAY } ] },
    { id: 's3', title: 'Rates of reaction: reading the graphs', subject: 'chemistry', topic: 'rates-of-reaction', cur: 'msce', when: at(3, 10), host: 'tadala.m', members: ['tadala.m', 'mphatso', 'chikondi_k'], invited: [], cap: 12,
      messages: [], questions: [], resources: [] },
  ];
  const resources = [
    { id: 'r1', title: 'Simultaneous equations notes', subject: 'mathematics', kind: 'Notes', author: 'aceitacademy', topic: 'simultaneous-equations', t: t - 5 * DAY },
    { id: 'r2', title: 'Osmosis notes', subject: 'biology', kind: 'Notes', author: 'aceitacademy', topic: 'osmosis', t: t - 5 * DAY },
    { id: 'r3', title: 'Rates of reaction notes', subject: 'chemistry', kind: 'Notes', author: 'aceitacademy', topic: 'rates-of-reaction', t: t - 5 * DAY },
    { id: 'r4', title: 'Speed, velocity and acceleration notes', subject: 'physics', kind: 'Notes', author: 'aceitacademy', topic: 'speed-velocity-acceleration', t: t - 5 * DAY },
  ];
  return { users, posts, sessions, resources };
}
