/** Public pages: landing, pricing, log in, sign up, contact. */
import { $, esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { now } from '../lib/time.js';
import { hashText } from '../lib/share.js';
import { CONFIG } from '../config.js';
import { CURRICULA, SUBJECTS } from '../data/subjects.js';
import { S, me, save, createAccount, signIn, signOut, usernameTaken } from '../state.js';
import { isLive, dbSignUp, dbSignIn, dbSignOut, dbGetProfile } from '../lib/supabase.js';
import { addRoute, go, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { toast, closeOverlay } from '../ui/overlay.js';

/* ---------- Pricing ---------- */
const FEATURES = ['Focused notes and revision resources', 'Questions with instant feedback', 'Gap finding and fixing', 'Community and Study Together'];
const PLANS = {
  malawi: 'Malawi plan (MK5,000 / month)',
  'intl-month': 'International plan ($4 / month)',
  'intl-year': 'International plan ($40 / year)',
};
export const planName = (p) => PLANS[p] || 'No plan yet';
let billing = 'month';

export function pricingCards(signedIn) {
  const current = signedIn ? me().plan : null;
  const button = (plan, label) => (signedIn
    ? `<button class="btn btn-block" type="button" data-act="choose-plan" data-plan="${plan}">${current === plan ? 'Your current plan' : label}</button>`
    : `<a class="btn btn-block" href="#/signup?plan=${plan}">${label}</a>`);
  const list = `<ul>${FEATURES.map((f) => `<li>${icon('check', 18)}${f}</li>`).join('')}</ul>`;
  return `<div class="plans">
    <article class="plan-card mw">
      <span class="plan-tag">For students in Malawi</span>
      <h3>Malawi plan</h3>
      <p class="price"><b>MK5,000</b><span>/ month</span></p>
      <p class="note">Billed monthly in kwacha.</p>
      ${list}${button('malawi', 'Choose Malawi plan')}
    </article>
    <article class="plan-card intl">
      <span class="plan-tag">For students outside Malawi</span>
      <h3>International plan</h3>
      <div class="seg" role="group" aria-label="Billing period" style="margin-top:6px">
        <button type="button" data-act="billing" data-v="month" aria-pressed="${billing === 'month'}">Monthly</button>
        <button type="button" data-act="billing" data-v="year" aria-pressed="${billing === 'year'}">Yearly</button>
      </div>
      ${billing === 'month'
        ? '<p class="price"><b>$4</b><span>/ month</span></p><p class="note">Billed monthly.</p>'
        : '<p class="price"><b>$40</b><span>/ year</span><span class="save-tag">Save 17%</span></p><p class="note">About $3.33 a month, billed yearly.</p>'}
      ${list}${button(billing === 'month' ? 'intl-month' : 'intl-year', billing === 'month' ? 'Choose monthly' : 'Choose yearly')}
    </article>
  </div>`;
}
export function fillLandingPricing() { const slot = $('#landing-pricing'); if (slot) slot.innerHTML = pricingCards(!!S.me); }

onClick('billing', (el) => {
  billing = el.dataset.v;
  const slot = el.closest('#pricing-slot, #landing-pricing');
  if (slot) { slot.innerHTML = pricingCards(!!S.me); const b = $(`[data-act="billing"][data-v="${billing}"]`, slot); if (b) b.focus(); }
});
onClick('choose-plan', (el) => {
  me().plan = el.dataset.plan; save();
  toast(`${planName(el.dataset.plan)} selected. Online payment isn\u2019t connected yet.`);
  const slot = el.closest('#pricing-slot, #landing-pricing'); if (slot) slot.innerHTML = pricingCards(true);
  if (!$('#app').hidden) refresh();
});

/* ---------- Pages ---------- */
addRoute('/', 'site', () => { fillLandingPricing(); return { title: 'aceitacademy' }; });
addRoute('/start', 'site', () => { go(S.me ? '#/app/home' : '#/signup', true); return null; });

addRoute('/pricing', 'public', () => ({ title: 'Pricing', html: `<section class="public-page wrap">
  <h1 class="page-title" style="text-align:center">Simple, affordable pricing</h1>
  <p class="page-sub" style="text-align:center">One plan for students in Malawi, one for everyone else. Same features on both.</p>
  <div id="pricing-slot">${pricingCards(!!S.me)}</div></section>` }));

addRoute('/login', 'public', () => {
  if (S.me) { go('#/app/home', true); return null; }
  return { title: 'Log in', html: `<section class="public-page wrap"><div class="auth">
  <h1>Welcome back.</h1><p class="sub">Pick up where you left off.</p><p class="preview-note">Design preview. Use a demo account or explore as a guest.</p>
  <form class="form-card" data-form="login" novalidate>
    <div class="field"><label for="li-email">Email</label><input class="input" id="li-email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="li-pw">Password</label><input class="input" id="li-pw" name="password" type="password" autocomplete="current-password" required></div>
    <p class="err" data-err hidden></p>
    <button class="btn btn-block" type="submit">Log in</button>
    <div class="or">or</div>
    <button class="btn-quiet btn-block" type="button" data-act="guest">Explore as a guest</button>
  </form>
  <p class="alt">New here? <a class="link" href="#/signup">Create an account</a></p></div></section>` };
});

const pickGroup = (legend, type, name, items, isChecked) => `<fieldset class="field" style="border:0;padding:0;margin:0 0 16px"><legend class="lab" style="margin-bottom:6px">${legend}</legend>
  <div class="pick">${items.map((x) => `<input type="${type}" id="${name}-${x.id}" name="${name}" value="${x.id}" ${isChecked(x) ? 'checked' : ''}><label for="${name}-${x.id}">${x.name}</label>`).join('')}</div></fieldset>`;
export { pickGroup };

addRoute('/signup', 'public', (query) => {
  if (S.me) { go(query.next ? '#' + query.next : '#/app/home', true); return null; }
  const plan = query.plan;
  return { title: 'Create your account', html: `<section class="public-page wrap"><div class="auth">
  <h1>A good place to start.</h1><p class="sub">Choose your syllabus and make yourself at home.</p><p class="preview-note">Design preview. Use sample details; this account stays on your device.</p>
  ${plan ? `<p class="tag good" style="margin:-8px 0 18px">Selected: ${esc(planName(plan))}</p>` : ''}
  <form class="form-card" data-form="signup" novalidate>
    <input type="hidden" name="plan" value="${esc(plan || '')}"><input type="hidden" name="next" value="${esc(query.next || '')}">
    <div class="field"><label for="su-name">Your name</label><input class="input" id="su-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="su-user">Username</label><input class="input" id="su-user" name="username" autocomplete="username" required><span class="hint">This is how other students see you. Letters, numbers, dots and underscores.</span></div>
    <div class="field"><label for="su-email">Email</label><input class="input" id="su-email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="su-pw">Password</label><input class="input" id="su-pw" name="password" type="password" autocomplete="new-password" minlength="8" required><span class="hint">At least 8 characters.</span></div>
    ${pickGroup('Which syllabus are you studying?', 'radio', 'curriculum', CURRICULA, (c) => c.id === (query.curriculum || 'msce'))}
    ${pickGroup('Your subjects', 'checkbox', 'subjects', SUBJECTS, (s) => s.id !== 'english')}
    <p class="err" data-err hidden></p>
    <button class="btn btn-block" type="submit">Create account</button>
    <div class="or">or</div>
    <button class="btn-quiet btn-block" type="button" data-act="guest">Explore as a guest</button>
  </form>
  <p class="alt">Already have an account? <a class="link" href="#/login">Log in</a></p></div></section>` };
});

addRoute('/contact', 'public', () => ({ title: 'Contact', html: `<section class="public-page wrap"><div class="auth">
  <h1>Let’s talk.</h1><p class="sub">Questions, partnerships or feedback.</p>${CONFIG.contactEmail ? '' : '<p class="preview-note">Preview form. Messages are saved on this device and are not sent.</p>'}
  <form class="form-card" data-form="contact" novalidate>
    <div class="field"><label for="ct-name">Name</label><input class="input" id="ct-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="ct-email">Email</label><input class="input" id="ct-email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="ct-msg">Message</label><textarea class="input" id="ct-msg" name="message" required></textarea></div>
    <p class="err" data-err hidden></p>
    <button class="btn btn-block" type="submit">Send message</button>
  </form></div></section>` }));

/* ---------- Accounts ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[A-Za-z0-9._]{3,20}$/;
export const USERNAME_RULE = 'Usernames are 3 to 20 characters: letters, numbers, dots or underscores.';
export { USERNAME, EMAIL };

onClick('guest', () => {
  let username; do { username = 'guest' + Math.floor(1000 + Math.random() * 9000); } while (usernameTaken(username));
  createAccount({ name: 'Guest', username, email: `${username}@guest.local`, pw: '', curriculum: new URLSearchParams(location.hash.split('?')[1] || '').get('curriculum') || 'msce', subjects: ['mathematics', 'biology', 'chemistry', 'physics'], main: 'mathematics', guest: true });
  const next = new URLSearchParams((location.hash.split('?')[1]) || '').get('next');
  go(next ? '#' + next : '#/app/home');
});
onClick('logout', async () => {
  if (isLive) await dbSignOut();
  signOut(); closeOverlay(true); go('#/'); toast('Logged out');
});

onSubmit('login', async (form, f) => {
  const email = f.val('email').toLowerCase();
  const password = String(f.data.get('password') || '');
  if (!email) return f.fail('Enter your email.', 'email');
  if (!password) return f.fail('Enter your password.', 'password');

  if (isLive) {
    const { data, error } = await dbSignIn({ email, password });
    if (error) return f.fail(error.message, 'password');
    if (data?.user) {
      const profile = await dbGetProfile(data.user.id);
      const name = profile?.full_name || data.user.user_metadata?.full_name || 'Student';
      const username = profile?.username || data.user.user_metadata?.username || email.split('@')[0];
      const curriculum = profile?.curriculum || data.user.user_metadata?.curriculum || 'msce';
      const subjects = profile?.subjects || data.user.user_metadata?.subjects || ['mathematics', 'biology', 'chemistry', 'physics'];
      const plan = profile?.plan || null;
      if (!S.accounts[email]) {
        createAccount({ name, username, email, pw: '', curriculum, subjects, main: subjects[0], plan, id: data.user.id });
      } else {
        Object.assign(S.accounts[email], { name, username, curriculum, subjects, plan, id: data.user.id });
      }
      signIn(email);
      toast(`Welcome back, ${name.split(' ')[0]}`);
      go('#/app/home');
      return;
    }
  }

  const account = S.accounts[email];
  if (!account) return f.fail('No account uses that email on this device. Check it, or create an account.', 'email');
  if (account.pw !== await hashText(password)) return f.fail('That password doesn\u2019t match. Try again.', 'password');
  signIn(email); toast(`Welcome back, ${account.name.split(' ')[0]}`); go('#/app/home');
});

onSubmit('signup', async (form, f) => {
  const name = f.val('name'), username = f.val('username'), email = f.val('email').toLowerCase();
  const password = String(f.data.get('password') || ''); const subjects = f.all('subjects');
  if (!name) return f.fail('Enter your name.', 'name');
  if (!USERNAME.test(username)) return f.fail(USERNAME_RULE, 'username');
  if (usernameTaken(username)) return f.fail('That username is taken. Try another.', 'username');
  if (!EMAIL.test(email)) return f.fail('Enter a valid email address.', 'email');
  if (password.length < 8) return f.fail('Use at least 8 characters for your password.', 'password');
  if (!subjects.length) return f.fail('Pick at least one subject.');

  if (isLive) {
    const { data, error } = await dbSignUp({
      email,
      password,
      name,
      username,
      curriculum: f.val('curriculum') || 'msce',
      subjects,
      plan: f.val('plan') || null,
    });
    if (error) return f.fail(error.message, 'email');

    createAccount({
      name,
      username,
      email,
      pw: '',
      curriculum: f.val('curriculum') || 'msce',
      subjects,
      main: subjects[0],
      plan: f.val('plan') || null,
      id: data?.user?.id,
    });

    if (data?.session) {
      toast(f.val('plan') ? `${planName(f.val('plan'))} saved.` : `Welcome, ${name.split(' ')[0]}`);
      go(f.val('next') ? '#' + f.val('next') : '#/app/home');
    } else {
      toast('Account created! Please check your email to confirm, then log in.');
      go('#/login');
    }
    return;
  }

  if (S.accounts[email]) return f.fail('An account already uses that email. Log in instead.', 'email');
  createAccount({ name, username, email, pw: await hashText(password), curriculum: f.val('curriculum') || 'msce', subjects, main: subjects[0], plan: f.val('plan') || null });
  toast(f.val('plan') ? `${planName(f.val('plan'))} saved. Online payment isn\u2019t connected yet.` : `Welcome, ${name.split(' ')[0]}`);
  go(f.val('next') ? '#' + f.val('next') : '#/app/home');
});

onSubmit('contact', (form, f) => {
  const name = f.val('name'), email = f.val('email'), message = f.val('message');
  if (!name) return f.fail('Enter your name.', 'name');
  if (!EMAIL.test(email)) return f.fail('Enter a valid email address.', 'email');
  if (message.length < 5) return f.fail('Write a message.', 'message');
  if (CONFIG.contactEmail) {
    location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent('Message from ' + name)}&body=${encodeURIComponent(`${message}\n\n${name} (${email})`)}`;
  } else { S.messages.push({ name, email, message, t: now() }); save(); }
  form.outerHTML = `<div class="form-card" role="status"><h2 style="font-size:1.3rem;margin-bottom:6px">${CONFIG.contactEmail ? 'Your email app is opening.' : 'Draft saved on this device.'}</h2><p class="muted" style="margin:0">Thanks, ${esc(name.split(' ')[0])}.</p></div>`;
});
