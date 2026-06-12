import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.contentEntry.deleteMany();

  await prisma.contentEntry.createMany({
    data: [
      {
        title: "Hello World",
        slug: "hello-world",
        author: "Sarah Chen",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28fd666f?w=800&h=400&fit=crop",
        content: "<p>Welcome to LearnCMS. Edit this post and watch it sync across every browser in real time.</p>",
        category: "Getting Started",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Understanding Headless CMS",
        slug: "understanding-headless-cms",
        author: "Alex Rivera",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
        content: "<p>A headless CMS serves content via APIs with no built-in frontend.</p>",
        category: "Architecture",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    ],
  });

  console.log("Database seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
