# Amitav's Todo

**Live:** https://amitav-todo.netlify.app

A personal task manager for Amitav. Full-width layout, quick task capture, daily filters, priorities, deadlines, project boards, checklists, notes, and links.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your MongoDB Atlas connection string, including the database name (`amitav_todo`). Keep the real credentials in `.env` only.
3. Run `npm run db:push` to sync MongoDB indexes and generate the Prisma client. MongoDB uses `db push`; the old SQLite migrations are retained as history only.
4. Optionally run `npm run db:seed` to create Personal, Learning, Side projects, and Office Project lists. This preserves existing data and does not add sample tasks.
5. Run `npm run dev` and open the URL shown in the terminal.

Tasks added without a project go into Personal automatically. The home page groups work into All tasks (unfinished), Today, Overdue, Upcoming, and Completed. Click a title to edit its details, or check the box to complete it.

## Stack and commands

Next.js App Router, TypeScript, Tailwind CSS, Prisma 6, MongoDB Atlas, and dnd-kit. IDs are strings mapped to MongoDB `_id` so existing references can be preserved. Atlas provides the replica set required by Prisma transactions and nested writes.

- `npm run dev`: development server
- `npm run build`: generate the database client and build for production
- `npm start`: production server
- `npm run lint`: ESLint
- `npm run db:push`: sync the database schema/indexes
- `npm run db:seed`: create missing personal lists without deleting data

Deployed on Netlify as `amitav-todo`. Set the same server-only `DATABASE_URL` environment variable in the host and allow the host network in Atlas. `.env`, local SQLite files, and `.local/` backups are ignored by Git.
