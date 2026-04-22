

const root = document.documentElement;
const btn  = document.getElementById('theme-toggle');

const stored = localStorage.getItem('basaira-theme'); 
if (stored === 'light' || stored === 'dark') {
  root.setAttribute('data-theme', stored);
  syncButton(stored);
}

btn?.addEventListener('click', () => {
  
  const current = root.getAttribute('data-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('basaira-theme', next);
  syncButton(next);
});

function syncButton(theme) {
  if (!btn) return;
  btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  btn.setAttribute('aria-label', theme === 'dark' ? 'switch to light theme' : 'switch to dark theme');
  btn.querySelector('span').textContent = theme === 'dark' ? '☀' : '☾';
}

const cards = Array.from(document.querySelectorAll('.card__link'));
let idx = -1;

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = prefersReduced ? 'auto' : 'smooth';

window.addEventListener('keydown', (e) => {
  
  if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    idx = Math.min(cards.length - 1, idx + 1);
    focusCard(idx);
  }
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    idx = Math.max(0, idx - 1);
    focusCard(idx);
  }
});

function focusCard(i) {
  const target = cards[i];
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
}

console.log('%c✶ basaira', 'color:#c9521f;font-family:monospace;font-size:14px;');
console.log('press j / k (or ↓ / ↑) to walk through the work.');
