# Design and implementation notes

## Design decisions

- One clear welcome promise with a short practice interaction. No invented student totals or success rates.
- A subject index with a syllabus selector, followed by notes → questions → help. The interface makes the next action obvious.
- Green is concentrated in actions, selection and the study invitation. Learning pages use neutral surfaces and readable text.
- Blogs are public editorial content; private learning progress belongs in the app.
- Spacious layouts, restrained borders, semantic buttons, visible focus, reduced-motion support and labelled theme controls.
- The group illustration closes the page with the brand's sense of togetherness. Most working screens put learning content first.

## What is interactive

The landing question provides answer-specific feedback and can be reset. Syllabus choices route into the corresponding signup choice. Guest access, notes, practice, mistake review, local community interactions, study sessions, chat, saved resources, Blogs and light/dark mode demonstrate frontend behaviour.

## What must be built for launch

| Area | Production implementation |
| --- | --- |
| Accounts | Server-managed authentication, secure sessions, recovery, verification and account deletion. Local demo password handling is not production authentication. |
| Authorisation | Enforce resource ownership, roles and paid access on the server; never trust browser state. |
| Learning | Map each syllabus and exam board accurately; review every note, question, answer and diagnostic label with qualified subject reviewers. Sample content is not a complete syllabus. |
| Progress | Store attempts, goals and history in a database; define scoring and mastery rules and handle synchronisation. |
| Community/chat | Shared persistence, realtime delivery, moderation, reporting, spam controls and appropriate privacy protections for students. Seed users and activity are illustrative. |
| Study sessions | Real membership, scheduling/time zones, invitation permissions and any audio/video service. The preview does not connect participants. |
| Uploads | Authorised object storage, file validation, limits, safe processing and content review. |
| Payments | Confirm current prices and billing rules; implement payment-provider checkout and verified webhooks. No payments are taken here. |
| Blogs | Editorial CMS, authorship, publication workflow, dates and permanent URLs. |
| Contact | Configure the real contact address and delivery service. The preview records drafts locally. |
| Release | Accessibility audit, real-device Safari/Chrome testing, security review, analytics consent where applicable and privacy/terms review. |

The source has distinct feature modules, but it is not a completed backend architecture. Replacing the local storage adapter alone will not produce a safe multi-user platform. Establish API contracts and move trust decisions to the server.

## References applied

These sources informed hierarchy, spacing, navigation and interaction choices; the site is an original composition, not a clone or a claim to have reproduced the books in full.

- Refactoring UI: https://www.refactoringui.com/
- W3C WAI design guidance: https://www.w3.org/WAI/tips/designing/
- Nielsen Norman Group, visual hierarchy: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- MDN, native dialogs: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog

The user's referenced books and visual direction were design context. No external illustration artist's work is presented as our own.
