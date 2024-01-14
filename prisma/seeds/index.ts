import { PrismaClient } from '@prisma/client';
import { USERS } from './user';
import { BOOKS } from './book';

const prisma = new PrismaClient()

async function main() {
  // seed Users
  await Promise.all(
    USERS.map(async (user) => {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name,
          id: user.id,
          role: user.role,
          password: user.password
        },
      })
    })
  )

  // seed Books
  await Promise.all(
    BOOKS.map(async (book) => {
      await prisma.book.upsert({
        where: { id: book.id },
        update: {},
        create: {
          id: book.id,
          title: book.title,
          synopsis: book.synopsis,
          author: book.author,
          publisher: book.publisher,
          publish_date: book.publish_date,
          pages: book.pages,
          quantity: book.quantity,
          price: book.price,
          cover_image: book.cover_image
        },
      })
    })
  )
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })