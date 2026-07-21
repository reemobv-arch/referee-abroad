# Referee Abroad — webapp prototype

Mobile-first, clickable prototype of the `my.refereeabroad.com` logged-in experience,
in the existing app's brand style (green `#44A546`, black, white, rounded Baloo 2 type).

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). Open it on your phone via the
`Network:` URL that Vite prints (same Wi-Fi), or add it to your home screen to see the
pinned-app feel.

## What's inside

Built with Vite + React + Tailwind + react-router (HashRouter) + lucide-react icons.

Screens / routes:
- `/login` — Welcome Back (any credentials → Sign in)
- `/` — Home (greeting, My Tournaments, Latest News, Upcoming)
- `/tournaments` — tournament list with photo heroes, price, APPLY NOW
- `/tournament/:id` — tournament detail: key times, logistics, agenda, documents, chat buttons
- `/tournament/:id/group` — group chat (send messages)
- `/chat` — 1:1 chat with the organisation (send messages)
- `/documents` — tickets, itinerary, contracts per tournament + general docs
- `/news` — news feed
- `/profile` — editable profile + save

All data is mocked in `src/data.js`. Tournament photos are local files in `public/img/`
(swap for the real tournament images later).

## Notes
- This is a front-end prototype: no backend, auth, or persistence.
- Next steps: wire to the WordPress user accounts / real tournament data, real 1:1 + group
  messaging backend, and the apply/checkout flow.
