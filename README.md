# AMK AI Support Platform

Advanced Hebrew RTL cloud support and operations platform for AMK Cloud Technologies.

## Features
- **Hebrew RTL Layout**: Fully localized interface for Israeli users.
- **Dark Premium Design**: High-end aesthetics with glassmorphism and 3D visuals.
- **AI Assistant**: Intelligent support bot with verified source tracking and confidence scores.
- **Infrastructure Monitoring**: Real-time server status and resource tracking.
- **Ticketing System**: Complete lifecycle management for support requests.
- **Role-Based Access**: Multi-role permission system (Administrator, Team Leader, Cloud Engineer, Support Agent, Customer).
- **Knowledge Base**: Structured technical documentation and guides.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Three Fiber
- Prisma (ORM)
- NextAuth.js (Authentication)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup environment variables in `.env`:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AI_API_KEY`
3. Initialize Database:
   ```bash
   npx prisma generate
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Design Principles
- **Clean & Modern**: No clutter, focus on data and usability.
- **3D Visuals**: Every main page includes tasteful 3D elements.
- **Responsive**: Mobile-first design that scales beautifully to desktop.
