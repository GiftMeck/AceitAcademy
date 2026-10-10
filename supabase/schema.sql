-- ==============================================================================
-- Aceitacademy Database Schema & Security Policies (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  full_name text not null,
  curriculum text not null default 'msce' check (curriculum in ('msce', 'igcse', 'gcse')),
  subjects jsonb default '["mathematics", "biology", "chemistry", "physics"]'::jsonb,
  main_subject text default 'mathematics',
  plan text default null, -- null, 'malawi', 'intl-month', 'intl-year'
  reputation integer default 0,
  created_at timestamptz default now()
);

-- Trigger: Automatically create public profile on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, curriculum, subjects, main_subject, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Student'),
    coalesce(new.raw_user_meta_data->>'curriculum', 'msce'),
    coalesce((new.raw_user_meta_data->'subjects')::jsonb, '["mathematics", "biology", "chemistry", "physics"]'::jsonb),
    coalesce(new.raw_user_meta_data->>'main_subject', 'mathematics'),
    new.raw_user_meta_data->>'plan'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. SUBJECTS & TOPICS (Syllabus Structure)
create table if not exists public.subjects (
  id text primary key,
  name text not null,
  color text not null,
  soft_color text not null
);

create table if not exists public.topics (
  id text primary key,
  subject_id text references public.subjects(id) on delete cascade not null,
  name text not null
);

-- 4. NOTES & ARTICLES
create table if not exists public.notes (
  id text primary key,
  topic_id text references public.topics(id) on delete cascade not null,
  title text not null,
  content text not null,
  read_minutes integer default 3,
  created_at timestamptz default now()
);

-- 5. DIAGNOSTIC PRACTICE QUESTIONS
create table if not exists public.questions (
  id text primary key,
  topic_id text references public.topics(id) on delete cascade not null,
  prompt text not null,
  equations text,
  options jsonb not null,
  explanation text not null
);

-- 6. STUDENT PROGRESS & QUESTION ATTEMPTS
create table if not exists public.question_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text references public.questions(id) on delete cascade not null,
  chosen_option text not null,
  is_correct boolean not null,
  gap_identified text,
  created_at timestamptz default now()
);

create table if not exists public.student_mastery (
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text references public.topics(id) on delete cascade not null,
  mastered boolean default false,
  gaps jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, topic_id)
);

-- 7. COMMUNITY DISCUSSIONS & REPUTATION
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text references public.subjects(id) on delete cascade not null,
  title text not null,
  body text not null,
  upvotes integer default 0,
  accepted_comment_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- 8. STUDY TOGETHER ROOMS & SESSIONS
create table if not exists public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text references public.subjects(id) on delete cascade not null,
  title text not null,
  scheduled_for timestamptz not null,
  duration_minutes integer default 45,
  created_at timestamptz default now()
);

create table if not exists public.study_session_members (
  session_id uuid references public.study_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  primary key (session_id, user_id)
);

-- 9. DIRECT MESSAGES
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.notes enable row level security;
alter table public.questions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.student_mastery enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_session_members enable row level security;
alter table public.direct_messages enable row level security;

-- Public read for curriculum materials
drop policy if exists "Allow public read of subjects" on public.subjects;
create policy "Allow public read of subjects" on public.subjects for select using (true);

drop policy if exists "Allow public read of topics" on public.topics;
create policy "Allow public read of topics" on public.topics for select using (true);

drop policy if exists "Allow public read of notes" on public.notes;
create policy "Allow public read of notes" on public.notes for select using (true);

drop policy if exists "Allow public read of questions" on public.questions;
create policy "Allow public read of questions" on public.questions for select using (true);

-- Profiles
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles" on public.profiles for select using (true);

drop policy if exists "Owner can update profile" on public.profiles;
create policy "Owner can update profile" on public.profiles for update using (auth.uid() = id);

-- Question attempts
drop policy if exists "Student view own attempts" on public.question_attempts;
create policy "Student view own attempts" on public.question_attempts for select using (auth.uid() = user_id);

drop policy if exists "Student insert own attempts" on public.question_attempts;
create policy "Student insert own attempts" on public.question_attempts for insert with check (auth.uid() = user_id);

-- Mastery
drop policy if exists "Student view own mastery" on public.student_mastery;
create policy "Student view own mastery" on public.student_mastery for select using (auth.uid() = user_id);

drop policy if exists "Student update own mastery" on public.student_mastery;
create policy "Student update own mastery" on public.student_mastery for all using (auth.uid() = user_id);

-- Forum posts & comments
drop policy if exists "Public read posts" on public.posts;
create policy "Public read posts" on public.posts for select using (true);

drop policy if exists "Authenticated insert posts" on public.posts;
create policy "Authenticated insert posts" on public.posts for insert with check (auth.uid() = author_id);

drop policy if exists "Public read comments" on public.comments;
create policy "Public read comments" on public.comments for select using (true);

drop policy if exists "Authenticated insert comments" on public.comments;
create policy "Authenticated insert comments" on public.comments for insert with check (auth.uid() = author_id);

-- Study sessions
drop policy if exists "Public read study sessions" on public.study_sessions;
create policy "Public read study sessions" on public.study_sessions for select using (true);

drop policy if exists "Authenticated create study session" on public.study_sessions;
create policy "Authenticated create study session" on public.study_sessions for insert with check (auth.uid() = host_id);

drop policy if exists "Public read session members" on public.study_session_members;
create policy "Public read session members" on public.study_session_members for select using (true);

drop policy if exists "Authenticated join session" on public.study_session_members;
create policy "Authenticated join session" on public.study_session_members for insert with check (auth.uid() = user_id);

-- Direct messages
drop policy if exists "Users read own DMs" on public.direct_messages;
create policy "Users read own DMs" on public.direct_messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users send DMs" on public.direct_messages;
create policy "Users send DMs" on public.direct_messages for insert with check (auth.uid() = sender_id);

-- ==============================================================================
-- INITIAL SEED DATA (Subjects & Sample Topics from aceitacademy)
-- ==============================================================================

insert into public.subjects (id, name, color, soft_color) values
  ('mathematics', 'Mathematics', '#4F6BEF', '#E7EBFD'),
  ('biology', 'Biology', '#0E9F5B', '#DDF6E9'),
  ('chemistry', 'Chemistry', '#D6457F', '#FCE5EF'),
  ('physics', 'Physics', '#C98A00', '#FFF3D6'),
  ('english', 'English', '#7A5CE0', '#EEE9FC')
on conflict (id) do nothing;

insert into public.topics (id, subject_id, name) values
  ('simultaneous-equations', 'mathematics', 'Simultaneous equations'),
  ('quadratic-equations', 'mathematics', 'Quadratic equations'),
  ('indices', 'mathematics', 'Indices'),
  ('trigonometry', 'mathematics', 'Trigonometry'),
  ('osmosis', 'biology', 'Osmosis'),
  ('photosynthesis', 'biology', 'Photosynthesis'),
  ('enzymes', 'biology', 'Enzymes'),
  ('human-nutrition', 'biology', 'Human nutrition'),
  ('rates-of-reaction', 'chemistry', 'Rates of reaction'),
  ('acids-bases-salts', 'chemistry', 'Acids, bases and salts'),
  ('atomic-structure', 'chemistry', 'Atomic structure'),
  ('the-mole', 'chemistry', 'The mole'),
  ('speed-velocity-acceleration', 'physics', 'Speed, velocity and acceleration'),
  ('forces', 'physics', 'Forces and motion'),
  ('electricity', 'physics', 'Electricity'),
  ('waves', 'physics', 'Waves'),
  ('summary-writing', 'english', 'Summary writing'),
  ('comprehension', 'english', 'Comprehension'),
  ('composition', 'english', 'Composition')
on conflict (id) do nothing;

