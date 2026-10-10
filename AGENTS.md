- Project: Scalvio, a tiny, fast, full-stack CMS. Next.js + shadcn/ui + Tailwind only. Replaces Payload (too heavy).
- Stack: MongoDB (official `mongodb` driver only, no Mongoose). No new dependency without asking.
- Server Components by default. "use client" only for state/events.
- Structure: `scalvio/` is the server-only backend core (db, auth, access, collections, api; every file starts with `import "server-only"`). `app/admin` = admin panel, `app/dashboard` = admin dashboard, `app/auth` = login for everyone. `components/ui` = shadcn only.
- Fully controlled access: never touch the DB from `app/`. Everything goes through `scalvio/api`, which checks getCurrentUser() + can(user, action, collection). Deny by default.
- Schema-driven: a file in `scalvio/collections/` is the single source of truth for validation, access, indexes, and admin UI. NEVER hand-write per-collection pages or handlers. A new field type = one case each in schema.ts, components/admin/field.tsx, and the validator.
- Auth: signed httpOnly cookie (HMAC via Web Crypto), PBKDF2 password hashing via Web Crypto. No auth library.
- Styling: Tailwind + shadcn only. No other CSS or UI library.
- Fetch in parallel with Promise.all, stream with Suspense, keep client components tiny.
- Skills live in `.agent/skills/`: scalvio-collection, scalvio-page, scalvio-ui.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
