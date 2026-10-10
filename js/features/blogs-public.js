/** Company articles are public; student progress remains inside the app. */
import { BLOGS } from '../data/blogs.js';
import { esc } from '../lib/dom.js';
import { addRoute, go } from '../router.js';

addRoute('/blogs', 'public', () => ({
  title: 'Blogs',
  html: `<section class="public-page wrap">
    <div class="blogs-head"><p class="eyebrow">The aceitacademy blog</p>
      <h1 class="page-title">A little perspective.<br>A better way to study.</h1>
      <p class="page-sub">Practical ideas for your next study session, from the aceitacademy team.</p>
    </div>
    <div class="blog-grid">${BLOGS.map(b => `<article class="blog-card">
      <span class="tag">${esc(b.tag)}</span>
      <h2><a href="#/blogs/${b.id}">${esc(b.title)}</a></h2>
      <p>${esc(b.lede)}</p>
      <div class="blog-meta"><span>aceitacademy</span><span>· ${b.mins} min read</span></div>
      <a class="link" href="#/blogs/${b.id}">Read article <span aria-hidden="true">↗</span></a>
    </article>`).join('')}</div>
  </section>`
}));

addRoute('/blogs/:id', 'public', id => {
  const b = BLOGS.find(b => b.id === id);
  if (!b) { go('#/blogs', true); return null; }
  return { title: b.title, html: `<article class="public-page wrap article-page">
    <a class="link small" href="#/blogs">← All articles</a>
    <p class="eyebrow" style="margin-top:32px">${esc(b.tag)}</p>
    <h1>${esc(b.title)}</h1>
    <div class="blog-meta"><span>By aceitacademy</span><span>· ${b.mins} min read</span></div>
    <p class="page-sub">${esc(b.lede)}</p>
    <div class="article-body">${b.body}</div>
    <a class="btn-quiet" href="#/blogs">Back to Blogs</a>
  </article>` };
});
