/* =====================================================================
   papers.js — hover citation cards for the two papers named in the entry.
   Re-imagines the ANIMUS PDF-popover as a proper citation card: title,
   authors, venue, a one-line significance gloss, and the actual PDF page
   embedded beneath. Progressive enhancement — without JS the citations are
   plain links straight to the PDFs (data-no-popover keeps popover.js off them).
   ===================================================================== */

const HOVER_DELAY_MS = 160;
const CLOSE_DELAY_MS = 240;

const PAPERS = {
  perceptron: {
    eyebrow: 'paper · 1958 · the artificial neuron',
    title: 'The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain',
    authors: 'Frank Rosenblatt',
    venue: 'Psychological Review · 65(6) · 386–408',
    gloss:
      'The origin point. A weighted sum of inputs, a threshold, and a rule that nudges the ' +
      'weights from the model’s own mistakes — the first machine proposed to <em>learn</em> ' +
      'rather than be programmed. Every net in this entry is its descendant.',
    quote: '“the perceptron may eventually be able to learn, make decisions, and translate languages.”',
    pdf: 'papers/perceptron.pdf',
    url: 'https://doi.org/10.1037/h0042519',
  },
  aiayn: {
    eyebrow: 'paper · 2017 · the transformer',
    title: 'Attention Is All You Need',
    authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin',
    venue: 'NeurIPS 2017 · arXiv:1706.03762',
    gloss:
      'The architecture the entry says every LLM is "some version of". It threw out recurrence ' +
      'and convolution and kept only <em>attention</em> — each token weighing every other. ' +
      'The shape didn’t change much after this; the training did.',
    quote: '“we propose a new simple network architecture, the Transformer, based solely on attention mechanisms.”',
    pdf: 'papers/aiayn.pdf',
    url: 'https://arxiv.org/abs/1706.03762',
  },
};

let popoverEl = null;
let currentAnchor = null;
let openTimer = null;
let closeTimer = null;

// ── pdf.js (CDN) — render page 1 of each paper to a crisp canvas thumbnail.
// More reliable + verifiable than an <iframe> (which won't paint in some
// headless / sandboxed contexts). Cached as a data-url per paper.
const PDFJS_VER = '4.0.379';
let pdfjsP = null;
function getPdfjs() {
  if (pdfjsP) return pdfjsP;
  pdfjsP = import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/build/pdf.min.mjs`)
    .then(lib => {
      lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/build/pdf.worker.min.mjs`;
      return lib;
    });
  return pdfjsP;
}
const thumbCache = {};
async function renderThumb(key, pdf, container) {
  if (!container) return;
  if (thumbCache[key]) return placeImg(container, thumbCache[key], key);
  try {
    const lib = await getPdfjs();
    const doc = await lib.getDocument(pdf).promise;
    const page = await doc.getPage(1);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    thumbCache[key] = canvas.toDataURL('image/png');
    placeImg(container, thumbCache[key], key);
  } catch (e) {
    const l = container.querySelector('.paper-card__pdf-loading');
    if (l) l.textContent = 'preview unavailable — open the pdf ↗';
  }
}
function placeImg(container, url, key) {
  container.querySelector('.paper-card__pdf-loading')?.remove();
  let img = container.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.className = 'paper-card__pdf-img';
    img.alt = `${key} — first page`;
    img.onload = () => { if (currentAnchor) position(currentAnchor); };
    container.insertBefore(img, container.firstChild);
  }
  img.src = url;
}

function buildPopover() {
  if (popoverEl) return popoverEl;
  popoverEl = document.createElement('div');
  popoverEl.className = 'paper-popover';
  popoverEl.setAttribute('role', 'tooltip');
  popoverEl.dataset.visible = 'false';
  popoverEl.addEventListener('mouseenter', cancelClose);
  popoverEl.addEventListener('mouseleave', scheduleClose);
  document.body.appendChild(popoverEl);
  return popoverEl;
}

function renderCard(key) {
  const p = PAPERS[key];
  if (!p) return '';
  return `
    <div class="paper-card">
      <div class="paper-card__head">
        <p class="paper-card__eyebrow">${p.eyebrow}</p>
        <h3 class="paper-card__title">${p.title}</h3>
        <p class="paper-card__authors">${p.authors}</p>
        <p class="paper-card__venue">${p.venue}</p>
      </div>
      <p class="paper-card__gloss">${p.gloss}</p>
      <p class="paper-card__quote">${p.quote}</p>
      <div class="paper-card__preview" data-pdf="${p.pdf}">
        <div class="paper-card__pdf-loading">rendering first page…</div>
        <div class="paper-card__sheen" aria-hidden="true"></div>
      </div>
      <div class="paper-card__foot">
        <a class="paper-card__link" href="${p.pdf}" target="_blank" rel="noopener">open pdf ↗</a>
        <a class="paper-card__link paper-card__link--muted" href="${p.url}" target="_blank" rel="noopener">source ↗</a>
      </div>
    </div>`;
}

function position(anchor) {
  const el = popoverEl;
  const rect = anchor.getBoundingClientRect();
  const margin = 12;
  const vw = window.innerWidth, vh = window.innerHeight;
  el.style.left = '0px'; el.style.top = '0px';
  const pw = el.offsetWidth, ph = el.offsetHeight;

  let top = rect.bottom + 8;
  if (top + ph > vh - margin) {
    const above = rect.top - 8 - ph;
    top = above >= margin ? above : Math.max(margin, vh - ph - margin);
  }
  let left = rect.left + rect.width / 2 - pw / 2;
  if (left + pw > vw - margin) left = vw - pw - margin;
  if (left < margin) left = margin;
  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
}

function show(anchor) {
  const key = anchor.dataset.paper;
  if (!PAPERS[key]) return;
  buildPopover();
  currentAnchor = anchor;
  popoverEl.innerHTML = renderCard(key);
  popoverEl.dataset.visible = 'true';
  position(anchor);
  renderThumb(key, PAPERS[key].pdf, popoverEl.querySelector('.paper-card__preview'));
}

function hide() {
  if (!popoverEl) return;
  popoverEl.dataset.visible = 'false';
  currentAnchor = null;
}

function cancelClose() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }
function scheduleClose() { cancelClose(); closeTimer = setTimeout(hide, CLOSE_DELAY_MS); }

function wire(anchor) {
  anchor.addEventListener('mouseenter', () => {
    cancelClose();
    if (openTimer) clearTimeout(openTimer);
    openTimer = setTimeout(() => show(anchor), HOVER_DELAY_MS);
  });
  anchor.addEventListener('mouseleave', () => {
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    scheduleClose();
  });
  // keyboard / a11y: focus opens, blur closes
  anchor.addEventListener('focus', () => { cancelClose(); show(anchor); });
  anchor.addEventListener('blur', scheduleClose);
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
window.addEventListener('scroll', () => { if (currentAnchor) position(currentAnchor); }, { passive: true });

function init() {
  document.querySelectorAll('a.paper-cite[data-paper]').forEach(wire);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
