/**
 * Supabase client and backend integration helper.
 */
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config.js';

const url = (CONFIG.supabaseUrl || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const key = CONFIG.supabaseAnonKey || '';

export const isLive = Boolean(url && key && !url.includes('your-project'));

export const supabase = isLive
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Register a new student account in Supabase.
 */
export async function dbSignUp({ email, password, name, username, curriculum, subjects, plan }) {
  if (!supabase) return { error: { message: 'Database client not initialized.' } };
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        username,
        curriculum: curriculum || 'msce',
        subjects: subjects || ['mathematics', 'biology', 'chemistry', 'physics'],
        main_subject: subjects?.[0] || 'mathematics',
        plan: plan || null,
      },
    },
  });

  return { data, error };
}

/**
 * Sign in existing student with email and password.
 */
export async function dbSignIn({ email, password }) {
  if (!supabase) return { error: { message: 'Database client not initialized.' } };
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out current student.
 */
export async function dbSignOut() {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Get the current active Supabase auth session.
 */
export async function dbGetSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

/**
 * Fetch profile details for a given user UUID.
 */
export async function dbGetProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.warn('[Supabase] Failed to fetch profile:', error.message);
  return data || null;
}

/**
 * Update student profile.
 */
export async function dbUpdateProfile(userId, updates) {
  if (!supabase) return { error: { message: 'Database client not initialized.' } };
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
}

/**
 * Record a question attempt and diagnostic gap.
 */
export async function dbRecordAttempt({ questionId, chosenOption, isCorrect, gapIdentified }) {
  if (!supabase) return;
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return;
  const { error } = await supabase.from('question_attempts').insert({
    user_id: user.id,
    question_id: questionId,
    chosen_option: String(chosenOption),
    is_correct: isCorrect,
    gap_identified: gapIdentified || null,
  });
  if (error) console.warn('[Supabase] Failed to record attempt:', error.message);
}

/**
 * Save topic mastery status and identified weak spots.
 */
export async function dbSaveMastery({ topicId, mastered, gaps }) {
  if (!supabase) return;
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return;
  const { error } = await supabase.from('student_mastery').upsert({
    user_id: user.id,
    topic_id: topicId,
    mastered: Boolean(mastered),
    gaps: gaps || [],
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('[Supabase] Failed to update mastery:', error.message);
}

/**
 * Fetch all topic masteries for the current student.
 */
export async function dbGetMastery() {
  if (!supabase) return [];
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('student_mastery')
    .select('*')
    .eq('user_id', user.id);
  if (error) {
    console.warn('[Supabase] Failed to load mastery:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Real-time channel for Study Together rooms.
 */
export function subscribeToSessionRoom(sessionId, { onMessage, onPresence }) {
  if (!supabase) return null;
  const channel = supabase.channel(`session-room:${sessionId}`, {
    config: { broadcast: { self: false } },
  });

  if (onMessage) {
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      onMessage(payload);
    });
  }

  if (onPresence) {
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresence(state);
    });
  }

  channel.subscribe();
  return channel;
}

export async function broadcastSessionMessage(channel, message) {
  if (!channel) return;
  await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: message,
  });
}

/**
 * Create a new forum post in Supabase.
 */
export async function dbCreatePost({ subjectId, title, body }) {
  if (!supabase) return null;
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      subject_id: subjectId,
      title,
      body,
    })
    .select('*, profiles(username, full_name)')
    .single();
  if (error) console.warn('[Supabase] Failed to create post:', error.message);
  return data || null;
}

/**
 * Fetch all posts and their comments from Supabase.
 */
export async function dbGetPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, full_name), comments(*, profiles(username, full_name))')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[Supabase] Failed to load posts:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Post a comment or answer to a forum post.
 */
export async function dbCreateComment({ postId, body }) {
  if (!supabase) return null;
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      body,
    })
    .select('*, profiles(username, full_name)')
    .single();
  if (error) console.warn('[Supabase] Failed to create comment:', error.message);
  return data || null;
}



