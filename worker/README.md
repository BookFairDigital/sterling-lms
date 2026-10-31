# Sterling LMS API

Cloudflare Worker API backed by D1 and R2.

## Deploy
From this directory, run `npx wrangler deploy --config wrangler.toml`.

Set the one-time admin bootstrap secret before first use:
`npx wrangler secret put BOOTSTRAP_SECRET --config wrangler.toml`

The secret must be a long random value. Never commit it to GitHub or send it in chat.

## First admin
POST `/auth/bootstrap` with JSON:
`{"secret":"...","email":"n.imethdm@gmail.com","password":"a-long-password-at-least-12-chars","full_name":"Administrator"}`

This endpoint only works once, only for the invited admin email, and only while no admin exists. Then sign in at `/auth/login`.
