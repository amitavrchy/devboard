import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Stable IDs keep this safe to rerun without replacing personal data.
  const lists = [
    { id: "personal-inbox", name: "Personal", description: "My everyday tasks and reminders" },
    { id: "personal-learning", name: "Learning", description: "Things I want to learn and practice" },
    { id: "personal-side-projects", name: "Side projects", description: "Ideas and builds I want to make time for" },
    { id: "office-project", name: "Office Project", description: "My office projects, tasks, and deadlines" },
  ];
  for (const list of lists) {
    await prisma.project.upsert({
      where: { id: list.id },
      create: { ...list, status: "active" },
      update: {},
    });
  }
  console.log("Personal lists ready. Existing tasks and projects preserved.");
}

main()
  .catch(() => {
    console.error("Could not prepare personal lists. Check your database connection.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
