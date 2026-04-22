# Week 2: The Anatomy of a Web Page, Part 2

## Weekly Task: Creative Hyperlinks — ORION

### Concept
ORION is a short narrative about a man smoking alone at night. The text contains naturally evocative objects — a warm orange glow, a brass lighter, wispy clouds, shooting stars. Each of these becomes a **hyperlink to another page**, turning the act of reading into the act of navigating. The web *is* the medium *is* the message.

### How it works
The story is split across 6 HTML pages:

```
index.html          → Cover: "ORION" + Enter
├── pages/glow.html     → Scene I: "A warm orange glow..."
│   ├── → lighter.html  → Scene II: "Before replacing the lighter..."
│   │   ├── → memory.html   (branch: scuffs & marks, old things)
│   │   └── → sky.html      → Scene III: "Some wispy clouds..."
│   │       └── → star.html → Scene IV: "Somehow he always saw shooting stars..."
│   └── → crackle.html (branch: the sound, pulls him back)
└── loop: star → glow (asks God / asks the glow to begin again)
```

The narrative is **non-linear by default**. A reader can follow the "main path" (glow → lighter → sky → star) or branch off through sensory details (crackle, memory). The last scene loops back to the first — like a man stuck on a ritual night.

### Design decisions
- **Links don't look like links** — they blend into the prose with dotted underlines. On hover, they *glow* (flame-orange for tangible objects, star-gold for celestial things, smoke-grey for memory/abstraction). This mirrors the story's themes of things that reveal themselves only when you pay attention.
- **Each page has its own background gradient** — `page-glow` is warmer (the lighter), `page-sky` is cooler (the open sky), `page-star` is the deepest.
- **CSS custom properties** — all colours and fonts are tokens, making the whole system adjustable.
- **Semantic HTML throughout** — `<main>`, `<nav>` with `aria-label`, `skip-link`, `alt` text, `meta description`.

### What this demonstrates (assessment mapping)
| Requirement | How ORION addresses it |
|---|---|
| **Semantic HTML** | `<main>`, `<nav>`, `<a>` with meaningful `aria-label`, `meta description` on every page |
| **IDs vs Classes** | IDs for `#main-content` (skip-link target), classes for `.narrative-link`, `.star`, `.smoke` |
| **CSS with classes** | All styling via classes — `.narrative-link`, `.scene-title`, `.nav-path`, `.page-*` |
| **Images & accessibility** | `alt` text on all images, `aria-label` on all links, skip-link for keyboard users |
| **Hyperlinks as art** | The entire piece is hyperlinks-as-art — the navigation IS the narrative |
| **Cross-platform** | Responsive CSS with `max-width: 65ch`, mobile breakpoint at 600px |

### AI Disclaimer
- No AI was used to generate the narrative text (original creative writing).
- CSS structure and semantic HTML patterns were discussed with pi (coding agent) as a learning tool. All code was written by the student with guidance.

## Task 1: CSS Practice
- [ ] Complete w3schools CSS Selectors exercises
- [ ] Complete w3schools CSS How To exercises

## Task 2: Portfolio Initial Setup
- [ ] Create `index.html`, `about.html`, `style.css`
- [ ] Style with CSS classes
- *(This will be addressed as part of the MAKAIRA portfolio build in later weeks)*

## Resources Used
- [MDN: HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [CSS Tricks: Specifics on CSS Specificity](https://css-tricks.com/specifics-on-css-specificity/)
- Google Fonts: Crimson Pro, Space Mono
