/** A small, real practice interaction on the welcome page. No account or request. */
import { $, $$ } from '../lib/dom.js';
import { onClick } from '../ui/events.js';

const feedback = {
  correct: '<strong>That’s it. You’ve got this.</strong><p>Add the equations: 2x = 14, so x = 7. Then y = 10 − 7 = 3.</p>',
  divide: '<strong>One more step and you’re there.</strong><p>Adding gives 2x = 14. Divide by 2 to get x = 7, then substitute to find y = 3.</p>',
  reverse: '<strong>Check the second equation.</strong><p>3 − 7 is −4, not 4. Add the equations first: 2x = 14, so x = 7 and y = 3.</p>'
};
onClick('try-answer', el => {
  $$('[data-act="try-answer"]').forEach(button => {
    button.removeAttribute('data-result');
    button.setAttribute('aria-pressed', String(button === el));
    button.querySelector('.choice-status').textContent = '';
  });
  el.dataset.result = el.dataset.answer === 'correct' ? 'correct' : 'wrong';
  el.querySelector('.choice-status').textContent = el.dataset.answer === 'correct' ? '✓' : '↻';
  $('#try-feedback').innerHTML = feedback[el.dataset.answer];
  $('[data-act="reset-question"]').hidden = false;
});
onClick('reset-question', () => {
  $$('[data-act="try-answer"]').forEach(button => {
    button.removeAttribute('data-result');
    button.setAttribute('aria-pressed', 'false');
    button.querySelector('.choice-status').textContent = '';
  });
  $('#try-feedback').innerHTML = '<p>Choose an answer. We’ll work through it together.</p>';
  $('[data-act="reset-question"]').hidden = true;
  $('[data-act="try-answer"]').focus();
});
onClick('landing-cur', el => {
  const cur = el.dataset.cur;
  $$('[data-act="landing-cur"]').forEach(button => button.setAttribute('aria-pressed', String(button === el)));
  $$('.subject-link').forEach(link => link.href = '#/signup?curriculum=' + cur + '&next=' + encodeURIComponent('/app/subjects/' + link.dataset.subject));
  $('#syllabus-status').textContent = 'Showing ' + el.textContent + ' subjects';
});
