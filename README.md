# Bookstore Backend

Small Node.js/Express backend scaffold for the Bookstore project.

Folders:
- `src/` core server code
- `src/controllers/` request handlers
- `src/models/` data models
- `src/routes/` route definitions
- `src/services/` business logic
- `src/config/` configuration
- `migrations/` DB migrations
- `tests/` unit/integration tests
- `scripts/` helper scripts
- `public/` static assets

To run:

```bash
npm install
npm run dev
```

Structure: feature-based modules under `src/modules/<feature>/` each containing `*.route.js`, `*.controller.js`, `*.service.js`, `*.model.js` for clear separation (books, auth, etc.).

Docker and nginx configs were removed from the main workflow; run frontend and backend dev servers separately.
