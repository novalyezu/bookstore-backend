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
        where: { id: user.id },
        update: user,
        create: user,
      })
    })
  )

  // seed Books
  await Promise.all(
    BOOKS.map(async (book) => {
      await prisma.book.upsert({
        where: { id: book.id },
        update: book,
        create: book,
      })
    })
  )

  // seed Orders
  await Promise.all(
    ORDERS.map(async (order) => {
      const { order_items, ...orderData } = order;
      const orderInput: Prisma.OrderUncheckedCreateInput = {
        order_status: randEnumValue(OrderStatus),
        ...orderData,
      };
      await prisma.$transaction(async (tx) => {
        await tx.order.upsert({
          where: { id: orderInput.id },
          update: orderInput,
          create: orderInput,
        });

        const orderItemsInput: Prisma.OrderItemUncheckedCreateInput[] = order_items.map(item => {
          return {
            order_id: orderData.id,
            ...item,
          }
        });

        await Promise.all(orderItemsInput.map(async (item) => {
          await tx.orderItem.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        }))
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