# Mechabook Frontend

Responsive frontend prototype for Mechabook — a social/community platform for mechanical keyboard enthusiasts.

## Included
- Responsive desktop + mobile layout
- Feed with post/comment/like/save interactions
- Profile, followers/following UI
- Explore/search UI
- Keyboard knowledge base UI
- Switch knowledge base + sound-test UI
- Switch comparison UI
- Buy & Sell marketplace
- Marketplace messaging demo
- Community rooms
- Vendor promotion / sponsored ads UI
- Mock data only — ready to connect to a FastAPI/PostgreSQL backend

## Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Backend later
Replace the mock data in `app/data/mock.ts` with API calls. Keep the UI components and route structure; add authentication, PostgreSQL models, image storage, real-time messaging and moderation on the backend.
