/** Messages between students. */
import { $, esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { now, ago } from '../lib/time.js';
import { S, me, my, save } from '../state.js';
import { addRoute, refresh } from '../router.js';
import { onClick, onSubmit } from '../ui/events.js';
import { openModal } from '../ui/overlay.js';
import { avatar, knownTag, illustration } from '../ui/components.js';

function chatPage(open) {
  const a = me(); const d = my();
  const last = (list) => list[list.length - 1] || { t: 0, body: '' };
  const threads = Object.entries(d.dms).sort((x, y) => last(y[1]).t - last(x[1]).t);
  const messages = open ? (d.dms[open] || []) : [];
  return { title: open ? `Chat with ${open}` : 'Messages', nav: 'chat', after: () => { const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; }, html: `
  <div class="page-h"><div><h1>${open ? `<a href="#/app/chat" class="icon-btn" style="display:inline-grid;vertical-align:middle;margin-right:8px" aria-label="Back to messages">${icon('back')}</a>${esc(open)}` : 'Messages'}</h1></div>${open ? '' : `<button class="btn btn-sm" type="button" data-act="new-chat">${icon('plus', 18)}New message</button>`}</div>
  <div class="chat-layout${open ? ' in-thread' : ''}">
    <section class="card threads-col" aria-label="Conversations"><nav class="thread-list">${threads.map(([h, list]) => `<a href="#/app/chat/${encodeURIComponent(h)}"${h === open ? ' aria-current="page"' : ''}>${avatar(h)}<span class="grow" style="min-width:0"><b style="display:block">${esc(h)}</b><span class="muted small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(last(list).body || 'No messages yet')}</span></span></a>`).join('') || '<p class="muted">No conversations yet.</p>'}</nav></section>
    <section class="card" aria-label="Conversation">${open ? `
      <div class="messages" id="msgs">${messages.map((m) => `<div class="m ${m.from === a.username ? 'mine' : 'theirs'}">${esc(m.body)}<span class="m-meta">${ago(m.t)}</span></div>`).join('') || `<p class="muted">Start the conversation with ${esc(open)}.</p>`}</div>
      ${open === 'aceitacademy' ? '<p class="muted small">This is where aceitacademy updates arrive.</p>' : `<form class="composer" data-form="chat" data-to="${esc(open)}"><label class="sr-only" for="cmsg">Message</label><input class="input" id="cmsg" name="body" autocomplete="off" required placeholder="Write a message"><button class="send" type="submit" aria-label="Send">${icon('send', 20)}</button></form>`}`
      : `<div class="empty">${illustration('help')}<h3>Stuck? Ask someone.</h3><p>Message a student who knows the topic, or ask the whole community.</p><div class="actions" style="justify-content:center"><button class="btn btn-sm" type="button" data-act="new-chat">New message</button><a class="btn-quiet" href="#/app/community">Community</a></div></div>`}</section>
  </div>` };
}
addRoute('/app/chat', 'app', () => chatPage(null));
addRoute('/app/chat/:id', 'app', (handle) => chatPage(handle));

onClick('new-chat', () => openModal('New message', `<p class="muted">Who do you want to talk to?</p><nav class="thread-list">${Object.keys(S.users).map((h) => `<a href="#/app/chat/${encodeURIComponent(h)}">${avatar(h)}<span class="grow"><b>${esc(h)}</b>${knownTag(h) ? `<br>${knownTag(h)}` : ''}</span></a>`).join('')}</nav>`));
onSubmit('chat', (form, f) => {
  const to = form.dataset.to; const body = f.val('body'); if (!body) return;
  const d = my(); (d.dms[to] = d.dms[to] || []).push({ from: me().username, body, t: now() });
  save(); refresh(); const i = $('#cmsg'); if (i) i.focus();
});
