import { v4 as uuidV4 } from 'uuid';
import { OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { USERS } from './user';
import { BOOKS } from './book';
import { ORDERS } from './order';

const prisma = new PrismaClient()

function randEnumValue<T>(enumObj: T): T[keyof T] {
  const enumValues = Object.values(enumObj);
  const index = Math.floor(Math.random() * enumValues.length);

  return enumValues[index];
}

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

  // seed Orders
  await Promise.all(
    ORDERS.map(async (order) => {
      const { order_items, ...orderData } = order;
      const orderId = uuidV4();
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            id: orderId,
            order_status: randEnumValue(OrderStatus),
            ...orderData,
          },
        });

        const orderItemsInput: Prisma.OrderItemUncheckedCreateInput[] = order_items.map(item => {
          return {
            id: uuidV4(),
            order_id: orderId,
            ...item,
          }
        });

        await tx.orderItem.createMany({
          data: orderItemsInput
        });
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