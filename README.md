# Miqat Panel · پنل میقات

The admin and participant panel for the Miqat festival website ([`miqat-web`](../miqat-web)).

- **Admin panel** (`/fa/admin`): ready.
- **Participant panel** (`/fa`): not built yet.

## Run it

You need Node.js 22 and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then open http://localhost:3001.

In `.env.local`, set `NEXT_PUBLIC_SITE_URL` to the address of the public website.

## Sign in

Sign in with a national ID (کد ملی):

| National ID  | Opens                                 |
| ------------ | ------------------------------------- |
| `1234567891` | Admin panel, full access              |
| `0087654326` | Admin panel, judge for photo/painting |
| `0012345679` | Participant panel                     |

The data is fake and resets when the server restarts.

## Where things are

- `src/app/` – pages
- `src/features/` – page parts and form actions
- `src/lib/admin/api/` – all data reading and writing
- `src/messages/` – Persian and English text

## Connecting a real backend

Today the data and sign-in are fake. To use a real API:

1. Change the functions in `src/lib/admin/api/` to call it.
2. Change the sign-in in `src/lib/auth/session.ts` and `src/lib/admin/api/auth.ts`.
3. Delete `src/lib/admin/seed` and `src/lib/admin/store.ts`.

## Rules

- Use `ms-`/`me-`, not `ml-`/`mr-` (the site is right-to-left).
- Import `Link` from `@/i18n/navigation`, not `next/link`.
- Run `pnpm check` before pushing.
