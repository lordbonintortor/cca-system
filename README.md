# CCA System

React, TypeScript, Vite, and Supabase app for Calinan Cockpit Arena operations.

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Create `.env.local` from `.env.example` and fill in the Supabase values:

```sh
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run locally:

```sh
npm run dev
```

## Production Deployment Checklist

Before deploying, confirm each item:

- Supabase Auth users exist for the people who need access.
- Programmer users have metadata containing `"role": "programmer"`.
- Hosting environment variables are set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Database SQL has been applied in this order:
  1. `src/lib/schema.sql`
  2. `src/lib/duplicate_event_names_migration.sql`
  3. `src/lib/audit_logs_migration.sql`
  4. `src/lib/member_schema_alignment_migration.sql`
  5. `src/lib/rls_policies_migration.sql`
- RLS is enabled and policies are active for all app tables.
- Direct route refreshes work, for example `/dashboard`, `/pairing`, and `/tagging`.
- Final checks pass:

```sh
npm run lint
npm run build
```

## Deployment Settings

Use these settings for common static hosts:

- Build command: `npm run build`
- Output directory: `dist`
- Vercel SPA rewrites are configured in `vercel.json`.
- Netlify SPA redirects are configured in `public/_redirects`.

## Login

The app uses Supabase Auth. Log in with a Supabase Auth user's email and password.

User display name and role are read from Supabase user metadata. If no role is set, the app defaults to `admin`.
