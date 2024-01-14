import { v4 as uuidV4 } from 'uuid';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService, PrismaTransaction } from 'src/helpers/prisma.service';
import { AppLogger } from 'src/helpers/logger.service';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { OrderItem, OrderStatus, Prisma, } from '@prisma/client';
import { CartOutputDto } from 'src/cart/dto/cart-output.dto';
import { UserService } from 'src/user/user.service';
import { UserOutputDto } from 'src/user/dto/user-output.dto';
import { plainToInstance } from 'class-transformer';
import { OrderListInput } from './dto/order-input.dto';
import { OrderListOutputDto, OrderOutputDto } from './dto/order-output.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(OrderService.name);
  }

  async adminOrder(ctx: RequestContext, input: CreateOrderDto): Promise<void> {
    this.logger.log(ctx, `${this.adminOrder.name} called`);

    const user = await this.userService.getById(ctx, input.buyer_id);

    if (input.carts.length < 1) {
      throw new BadRequestException('Your cart is empty')
    }

    const cartsOutput = plainToInstance(CartOutputDto, input.carts);
    await this.processOrder(ctx, user, input, cartsOutput);
  }

  async userOrder(ctx: RequestContext, input: CreateOrderDto): Promise<void> {
    this.logger.log(ctx, `${this.userOrder.name} called`);

    const userProm = this.userService.getById(ctx, ctx.user.sub);
    const cartsProm = this.prisma.cart.findMany({
      where: {
        user_id: ctx.user.sub,
      }
    });
    const [user, carts] = await Promise.all([userProm, cartsProm]);

    if (carts.length < 1) {
      throw new BadRequestException('Your cart is empty')
    }

    const cartsOutput: CartOutputDto[] = plainToInstance(CartOutputDto, carts);
    await this.processOrder(ctx, user, input, cartsOutput);

    // empty the carts
    await this.prisma.cart.deleteMany({
      where: {
        user_id: ctx.user.sub,
      }
    });
  }

  async processOrder(ctx: RequestContext, user: UserOutputDto, input: CreateOrderDto, carts: CartOutputDto[]): Promise<void> {
    this.logger.log(ctx, `${this.processOrder.name} called`);

    await this.prisma.$transaction(async (tx) => {
      const order: Prisma.OrderUncheckedCreateInput = {
        id: uuidV4(),
        buyer_id: user.id,
        buyer_email: user.email,
        buyer_name: user.name,
        shipping_name: input.shipping_name,
        shipping_phone: input.shipping_phone,
        shipping_address: input.shipping_address,
        total_quantity: 0,
        total_amount: 0,
        order_status: OrderStatus.PENDING,
      }
      const orderItems = await this.validateBookQty(ctx, tx, order.id, carts);
      order.total_quantity = orderItems.reduce((prev, val) => prev + val.quantity, 0);
      order.total_amount = orderItems.reduce((prev, val) => prev + val.total_amount, 0);

      await this.createOrder(ctx, tx, order);
      await this.createOrderItems(ctx, tx, orderItems);
      await this.decreaseBookQty(ctx, tx, orderItems);
    });
  }

  async validateBookQty(ctx: RequestContext, tx: PrismaTransaction, orderId: string, carts: CartOutputDto[]): Promise<Prisma.OrderItemUncheckedCreateInput[]> {
    this.logger.log(ctx, `${this.validateBookQty.name} called`);

    const bookIds = carts.map(cart => cart.book_id);
    const books = await tx.book.findMany({
      where: {
        id: {
          in: bookIds,
        }
      },
    });

    const orderItems: Prisma.OrderItemUncheckedCreateInput[] = [];
    for (let i = 0; i < carts.length; i++) {
      const cart = carts[i];
      const book = books.find(b => b.id === cart.book_id);
      if (!book) {
        throw new BadRequestException('Some books on cart not found')
      }
      if (book.quantity < cart.quantity) {
        throw new BadRequestException('Some books quantity less than on cart')
      }
      orderItems.push({
        id: uuidV4(),
        order_id: orderId,
        book_id: book.id,
        book_title: book.title,
        book_synopsis: book.synopsis,
        book_author: book.author,
        book_publisher: book.publisher,
        book_publish_date: book.publish_date,
        book_pages: book.pages,
        book_price: book.price,
        book_cover_image: book.cover_image,
        quantity: cart.quantity,
        total_amount: cart.quantity * book.price,
      });
    }

    return orderItems;
  }

  async createOrder(ctx: RequestContext, tx: PrismaTransaction, order: Prisma.OrderUncheckedCreateInput): Promise<void> {
    this.logger.log(ctx, `${this.createOrder.name} called`);
    await tx.order.create({
      data: order,
    });
  }

  async createOrderItems(ctx: RequestContext, tx: PrismaTransaction, items: Prisma.OrderItemUncheckedCreateInput[]): Promise<void> {
    this.logger.log(ctx, `${this.createOrderItems.name} called`);
    await Promise.all(
      items.map(async (item) => {
        await tx.orderItem.create({
          data: item,
        })
      })
    );
  }

  async decreaseBookQty(ctx: RequestContext, tx: PrismaTransaction, items: Prisma.OrderItemUncheckedCreateInput[]): Promise<void> {
    this.logger.log(ctx, `${this.decreaseBookQty.name} called`);
    await Promise.all(
      items.map(async (item) => {
        await tx.book.update({
          where: {
            id: item.book_id,
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        })
      })
    );
  }

  async increaseBookQty(ctx: RequestContext, tx: PrismaTransaction, items: OrderItem[]): Promise<void> {
    this.logger.log(ctx, `${this.increaseBookQty.name} called`);
    await Promise.all(
      items.map(async (item) => {
        await tx.book.update({
          where: {
            id: item.book_id,
          },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        })
      })
    );
  }

  async getAll(ctx: RequestContext, input: OrderListInput): Promise<OrderListOutputDto> {
    this.logger.log(ctx, `${this.getAll.name} called`);

    const conditions = {};
    const orderBy = {};

    if (input.buyer_id) {
      conditions['buyer_id'] = input.buyer_id;
    }

    if (input.orderBy) {
      const [key, sort] = input.orderBy.split('__')
      orderBy[key] = sort || 'desc';
    }

    const totalData = await this.prisma.order.count({
      where: conditions,
    });
    const totalPage = Math.ceil(totalData / input.limit);
    const page = input.page;

    const pagination = {
      currentPage: page,
      nextPage: (totalPage > page) ? page + 1 : null,
      prevPage: (page > 1) ? page - 1 : null,
      totalData: totalData,
      totalPage: totalPage,
    }

    const orders = await this.prisma.order.findMany({
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      where: conditions,
      orderBy,
      include: {
        orderItems: {
          take: 1
        }
      }
    });

    const ordersOutput = plainToInstance(OrderListOutputDto, {
      orders: orders.map(order => {
        return {
          ...order,
          order_items: order.orderItems,
        }
      }),
      pagination,
    }, {
      excludeExtraneousValues: true,
    });

    return ordersOutput;
  }

  async getById(ctx: RequestContext, orderId: string): Promise<OrderOutputDto> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId
      },
      include: {
        orderItems: {}
      }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderOutput = plainToInstance(OrderOutputDto, order, {
      excludeExtraneousValues: true,
    });
    orderOutput.order_items = order.orderItems;

    return orderOutput;
  }

  async remove(ctx: RequestContext, orderId: string): Promise<void> {
    this.logger.log(ctx, `${this.remove.name} called`);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {}
      }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.order_status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot remove paid order');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.delete({
        where: {
          id: orderId,
        }
      });

      await this.increaseBookQty(ctx, tx, order.orderItems);
    });
  }
}
