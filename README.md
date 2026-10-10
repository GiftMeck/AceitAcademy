# Aceitacademy — designer handoff

A fresh design built around a simple promise: understand a little more and feel a little less alone. The public welcome page opens before login. An actual practice question gives visitors a useful first interaction; subjects, notes, community and study sessions follow in a clear sequence.

## Open the preview

Open `dist/Aceitacademy_Redesigned.html` in a full web browser. It is a single HTML file with embedded styles, JavaScript, DM Sans and images. It needs no installation or internet connection. An attachment viewer may display the page without enabling JavaScript; use a browser to explore interactions.

Choose **Take a look inside** to explore with a sample account. Use sample details only. All accounts, messages, votes and progress are local demonstration data, not a connected service.

## Edit the source

This is plain HTML, CSS and JavaScript. Serve this folder with your editor's static web server to load `index.html` and its ES modules. To regenerate the portable file, install the development dependency with `npm install`, then run `npm run build` (Node 18 or newer). The output is `dist/Aceitacademy_Redesigned.html`.

| File | Purpose |
| --- | --- |
| `index.html` | Public welcome page and shared page containers |
| `css/tokens.css` | Brand colours, theme variables and local font |
| `css/site.css` | Public pages and responsive layouts |
| `css/app.css` | Student workspace |
| `css/components.css` | Buttons, forms, cards, menus and dialogs |
| `js/features/welcome.js` | Landing question and syllabus selector |
| `js/features/blogs-public.js` | Public Blogs and article pages |
| `js/features/` | Learning, practice, community, study rooms and account flows |
| `js/data/` | Sample subjects, notes, questions, articles and community records |
| `js/state.js` | Demo state and transitions |
| `js/lib/storage.js` | Browser storage with in-memory fallback |
| `scripts/build.mjs` | Offline HTML bundler |

## Brand and art

The verified primary colours are **dark cyan `#052323`** and **vivid green `#10DC85`**. Typography is locally bundled DM Sans. The supplied official logo is preserved: `assets/logo.svg` and `mascot.svg` are viewport wrappers around the original PNG, not recreated vector logos. The original PNG is included unchanged. Supply an official vector master for large print work.

Illustrations are high-resolution PNG assets, not screenshots enlarged from a mockup. The public layout uses one group illustration at the end, with limited artwork in app empty states. All supplied art is retained in the source folder; only assets used by the current design are embedded in the portable HTML. The font licence is in `assets/fonts/LICENSE.txt`.

## Product boundaries

Supported syllabuses are **MSCE, Cambridge IGCSE and GCSE only**. There is one Notes format. Blogs are accessible without signing in. Theme controls are visible in the public header and student workspace.

This is a frontend design prototype. Authentication, payments, shared posts, realtime chat and multi-user rooms need server implementation. See `HANDOFF.md` before production. Editing the frontend with AI remains possible after backend development, but route contracts, validation and authorisation must be preserved and tested.
