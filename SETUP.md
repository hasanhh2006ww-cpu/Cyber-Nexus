# Cyber Nexus - Setup Guide

 cybersecurity learning platform built with Next.js, Prisma 6, and PostgreSQL (Neon).

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ (recommended: 20 or 22)
- npm or yarn
- A Neon PostgreSQL account (free tier available)

### Install Dependencies
```bash
npm install
```

### Environment Variables
Copy the example env file and fill in your values:
```bash
cp .env.example .env
```

Required variables in `.env`:
```
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Run Database Migrations
```bash
npx prisma migrate deploy
```

### Seed the Database
```bash
npx prisma db seed
```

### Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts
| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | admin |
| ahmed@example.com | password123 | student |
| sara@example.com | password123 | student |
| mohammed@example.com | password123 | student |
| fatima@example.com | password123 | student |
| omar@example.com | password123 | student |

---

## 2. Neon Setup

### Create a Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### Get Your Connection String
1. In the Neon dashboard, go to **Dashboard**
2. Copy the connection string (it looks like):
   ```
   postgresql://neondb_owner:password@ep-xxx-region.aws.neon.tech/neondb?sslmode=require
   ```
3. Paste it into your `.env` file as `DATABASE_URL`

### Reset Database (if needed)
```bash
npx prisma migrate reset
npx prisma db seed
```

---

## 3. Running Migrations

### Development (creates new migration)
```bash
npx prisma migrate dev --name migration_name
```

### Production / Vercel (applies pending migrations)
```bash
npx prisma migrate deploy
```

### Check Migration Status
```bash
npx prisma migrate status
```

### View Database in Browser
```bash
npx prisma studio
```

---

## 4. Seeding the Database

### Run Seed
```bash
npx prisma db seed
```

### What the Seed Creates
- 6 users (1 admin + 5 students)
- 5 courses with sections
- 21 lessons with content
- 21 quizzes (one per lesson)
- 105 quiz questions (5 per quiz)
- 1 learning path with 3 courses

### Reset and Re-seed
```bash
npx prisma migrate reset   # Warning: deletes all data
npx prisma db seed
```

---

## 5. Deploy to Vercel

### One-Time Setup
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [https://vercel.com](https://vercel.com)
3. Import your repository
4. Configure environment variables (see Section 6)
5. Deploy

### Environment Variables for Vercel
| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Neon connection string |
| `NEXTAUTH_SECRET` | `your-random-secret` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

### Build Configuration
Vercel auto-detects Next.js. No manual build config needed. The `build` script automatically runs:
1. `prisma migrate deploy` - applies pending migrations
2. `prisma generate` - generates Prisma Client
3. `next build` - builds the application

### Generate a Production Secret
```bash
# macOS/Linux
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

---

## 6. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | Yes | Secret key for NextAuth.js session encryption |
| `NEXTAUTH_URL` | Yes | Base URL of the application |

---

## 7. Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build (migrate + generate + build) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create new Prisma migration |
| `npm run db:migrate:deploy` | Apply pending migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (browser UI) |
| `npm run db:push` | Push schema changes (no migration) |

---

## 8. Tech Stack

- **Framework**: Next.js 16.2.10
- **Language**: TypeScript (strict mode)
- **Database ORM**: Prisma 6.19.3
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js v5 (beta.31)
- **UI**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

---

## 9. Project Structure

```
cyber-nexus/
  prisma/
    schema.prisma          # Database schema (15 models)
    seed.ts                # Database seed script
    migrations/            # Prisma migrations
  src/
    app/
      (auth)/              # Login, Register pages
      (dashboard)/         # Student dashboard, courses, settings
      admin/               # Admin dashboard pages
      api/                 # API routes
    components/
      admin/               # Admin-specific components
      dashboard/           # Student dashboard components
      layout/              # Navbar, Sidebar
      ui/                  # shadcn/ui components
    lib/
      auth.ts              # NextAuth configuration
      prisma.ts            # Prisma client singleton
      session.ts           # Session/auth helpers
```
