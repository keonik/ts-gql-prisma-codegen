import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { email: "mmm@gmail.com", name: "Mr. Money Mustache" },
  { email: "ghan@gmail.com", name: "Graham Hancock" },
];

const rooms = [
  {
    name: "general",
  },
  {
    name: "fire",
  },
  {
    name: "history",
  },
];
async function main() {
  // delete and seed with sample data if in development
  if (process.env.NODE_ENV === "development") {
    console.log("\nDEV MODE 😎 \n");
    console.log("\n\tDeleting all data...\n");
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.room.deleteMany(),
    ]);
    console.log("\t🌱🌱🌱 Seeding data... 🌱🌱🌱\n");
    let roomTransactions = rooms.map((room) =>
      prisma.room.create({ data: { ...room, id: room.name } })
    );
    const seededRooms = await prisma.$transaction(roomTransactions);
    let userTransactions = users.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          rooms: { connect: rooms.map(({ name }) => ({ name })) },
        },
      })
    );
    const seededUsers = await prisma.$transaction(userTransactions);

    await prisma.message.createMany({
      data: seededUsers
        .map((user) =>
          seededRooms.map((room) => ({
            text: `Hey there! I'm ${user.name}! Glad to be in ${room.name}!`,
            roomId: room.id,
            userId: user.id,
          }))
        )
        .flat(),
    });
    console.log("\t🌱🌱🌱 Seeding complete! 🌱🌱🌱\n");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
