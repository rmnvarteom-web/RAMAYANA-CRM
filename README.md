# RAMAYANA CRM

B2B booking CRM for travel agencies (Thai beach club / attraction tickets).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Deployed on Vercel, database on Neon

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
