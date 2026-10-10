/**
 * Everything the site remembers lives in one object, `S`.
 *
 *   S.accounts   accounts on this device, keyed by email
 *   S.me         email of the signed-in student (or null)
 *   S.data       each student's progress, saved posts, messages...
 *   S.users      other community members
 *   S.posts, S.sessions, S.resources   community content
 *
 * Change data, then call save().
 */
import { CONFIG } from './config.js';
import { loadData, saveData } from './lib/storage.js';
import { uid } from './lib/dom.js';
import { now, when, MIN } from './lib/time.js';
import { sampleCommunity } from './data/sample.js';
import { BADGES, REPUTATION } from './data/badges.js';
import { toast } from './ui/overlay.js';
import { isLive, dbGetSession, dbGetProfile, dbGetMastery, dbGetPosts } from './lib/supabase.js';

function freshState() {
  return { v: 1, theme: 'system', nudgeMin: CONFIG.readingNudgeMinutes, accounts: {}, me: null, data: {}, messages: [], ...sampleCommunity() };
}

export let S = freshState();

export async function loadState() {
  const saved = await loadData(CONFIG.storageKey);
  if (saved && saved.v === 1) S = { ...freshState(), ...saved };

  if (isLive) {
    try {
      const session = await dbGetSession();
      if (session?.user) {
        const email = session.user.email;
        const profile = await dbGetProfile(session.user.id);
        const name = profile?.full_name || session.user.user_metadata?.full_name || 'Student';
        const username = profile?.username || session.user.user_metadata?.username || email.split('@')[0];
        const curriculum = profile?.curriculum || session.user.user_metadata?.curriculum || 'msce';
        const subjects = profile?.subjects || session.user.user_metadata?.subjects || ['mathematics', 'biology', 'chemistry', 'physics'];
        const plan = profile?.plan || null;

        if (!S.accounts[email]) {
          createAccount({ name, username, email, pw: '', curriculum, subjects, main: subjects[0], plan, id: session.user.id });
        } else {
          Object.assign(S.accounts[email], { name, username, curriculum, subjects, plan, id: session.user.id });
        }
        S.me = email;

        const masteries = await dbGetMastery();
        if (masteries && masteries.length) {
          const d = my();
          masteries.forEach((m) => {
            d.progress[m.topic_id] = {
              status: m.mastered ? 'mastered' : 'gaps',
              gaps: m.gaps || [],
              masteredAt: m.mastered ? new Date(m.updated_at).getTime() : null,
              wrong: {},
              attempts: 1,
            };
          });
        }
      }
    } catch (e) {
      console.warn('[Supabase] Auth/mastery sync warning:', e);
    }

    try {
      const dbPosts = await dbGetPosts();
      if (dbPosts && dbPosts.length) {
        dbPosts.forEach((dp) => {
          if (!S.posts.some((p) => p.id === dp.id)) {
            S.posts.unshift({
              id: dp.id,
              type: 'question',
              subject: dp.subject_id,
              author: dp.profiles?.username || 'Student',
              t: new Date(dp.created_at).getTime(),
              score: dp.upvotes || 0,
              title: dp.title,
              body: dp.body,
              reactions: { '👍': 0, '💡': 0, '🔥': 0 },
              comments: (dp.comments || []).map((dc) => ({
                id: dc.id,
                author: dc.profiles?.username || 'Student',
                t: new Date(dc.created_at).getTime(),
                score: dc.upvotes || 0,
                body: dc.body,
              })),
            });
          }
        });
      }
    } catch (e) {
      console.warn('[Supabase] Posts sync warning:', e);
    }
  }
}

let timer;
export function save() {
  clearTimeout(timer);
  timer = setTimeout(() => saveData(CONFIG.storageKey, S), 250);
}

/* ---------- The signed-in student ---------- */
export const me = () => (S.me ? S.accounts[S.me] : null);

function emptyData() {
  return {
    progress: {}, answered: 0, correct: 0, activity: [], notifs: [], saved: [], savedNotes: [],
    votes: {}, reactions: {}, joined: [], hosted: [], rep: 0, repBy: {}, badges: [], read: {}, dms: {}, contrib: 0,
  };
}
/** The signed-in student's own data. */
export const my = () => (S.me ? S.data[S.me] : emptyData());

export function newStudentData() {
  const d = emptyData(); const t = now(); const first = S.sessions[0];
  d.notifs = [
    { id: uid(), text: 'Welcome to aceitacademy. Pick a subject and start learning.', link: '#/app/subjects', t, read: false },
    first && { id: uid(), text: `"${first.title}" starts ${when(first.when).toLowerCase()}. Want to join?`, link: '#/app/session/' + first.id, t: t - MIN, read: false },
  ].filter(Boolean);
  d.dms = { aceitacademy: [{ from: 'aceitacademy', body: 'Welcome to aceitacademy! Stuck on something? Ask the community or start a study session. You never have to study alone.', t }] };
  return d;
}

export function createAccount(account) {
  S.accounts[account.email] = { plan: null, created: now(), ...account };
  S.data[account.email] = newStudentData();
  S.me = account.email; save();
}
export function signIn(email) { S.me = email; save(); }
export function signOut() { S.me = null; save(); }
export function resetMyProgress() { S.data[S.me] = newStudentData(); save(); }

export function usernameTaken(name, exceptEmail) {
  const l = name.toLowerCase();
  return l === 'aceitacademy'
    || Object.keys(S.users).some((h) => h.toLowerCase() === l)
    || Object.values(S.accounts).some((a) => a.username.toLowerCase() === l && a.email !== exceptEmail);
}

/** When a student changes username, update everything they wrote. */
export function renameEverywhere(from, to) {
  S.posts.forEach((p) => { if (p.author === from) p.author = to; p.comments.forEach((c) => { if (c.author === from) c.author = to; }); });
  S.sessions.forEach((s) => {
    if (s.host === from) s.host = to;
    s.members = s.members.map((m) => (m === from ? to : m));
    ['messages', 'questions', 'resources'].forEach((k) => s[k].forEach((x) => { if (x.author === from) x.author = to; }));
  });
  S.resources.forEach((r) => { if (r.author === from) r.author = to; });
  Object.values(my().dms).forEach((list) => list.forEach((m) => { if (m.from === from) m.from = to; }));
}

/* ---------- People ---------- */
export function knownFor() {
  return Object.entries(my().repBy || {}).filter(([, v]) => v >= REPUTATION.knownForThreshold).map(([k]) => k);
}
/** Name, reputation and expertise for any username. */
export function userInfo(handle) {
  const a = me();
  if (a && handle === a.username) return { name: a.name, rep: my().rep, known: knownFor(), isMe: true };
  if (handle === 'aceitacademy') return { name: 'aceitacademy', rep: 0, known: [] };
  return S.users[handle] || { name: handle, rep: 0, known: [] };
}

/* ---------- Progress, reputation, activity ---------- */
export function addReputation(points, subject) {
  const d = my();
  d.rep = Math.max(0, d.rep + points);
  if (subject) d.repBy[subject] = Math.max(0, (d.repBy[subject] || 0) + points);
}
export function logActivity(text, link) {
  const d = my(); d.activity.unshift({ text, link, t: now() }); d.activity = d.activity.slice(0, 40);
}
export function notify(text, link) { my().notifs.unshift({ id: uid(), text, link, t: now(), read: false }); }
export function award(badgeId) {
  const d = my();
  if (d.badges.includes(badgeId)) return;
  d.badges.push(badgeId);
  const b = BADGES.find((x) => x.id === badgeId);
  if (b) { notify(`New badge: ${b.name}`, '#/app/profile'); toast(`Badge earned: ${b.name}`); }
}
