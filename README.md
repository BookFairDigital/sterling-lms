# Sterling LMS

A Learning Management System built with React, TypeScript, Vite, Tailwind CSS, Supabase and Cloudflare R2.

## Development

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.

Never put Supabase secret/service-role keys or Cloudflare R2 credentials in browser environment variables.

## Current status

- React + TypeScript + Vite foundation
- Tailwind CSS v4 configured
- Supabase client scaffold (environment not configured yet)
- Initial responsive admin dashboard UI
- Database schema and RLS migration to follow