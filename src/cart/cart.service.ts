import { Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { PrismaService } from 'src/helpers/prisma.service';
import { AppLogger } from 'src/helpers/logger.service';
import { Prisma } from '@prisma/client';
import { BookService } from 'src/book/book.service';
import { CartListInput } from './dto/cart-input.dto';
import { CartListOutputDto } from './dto/cart-output.dto';
import { plainToInstance } from 'class-transformer';
import { RemoveCartDto } from './dto/remove-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private bookService: BookService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(CartService.name);
  }

  async addToCart(ctx: RequestContext, input: AddToCartDto): Promise<void> {
    this.logger.log(ctx, `${this.addToCart.name} called`);

    // check is book exists
    const bookProm = this.bookService.getById(ctx, input.book_id);
    // check is book already in cart
    const cartProm = this.prisma.cart.findFirst({
      where: {
        user_id: ctx.user.sub,
        book_id: input.book_id,
      }
    });
    const [_, currCart] = await Promise.all([bookProm, cartProm]);

    const compoundId: Prisma.CartUser_idBook_idCompoundUniqueInput = {
      user_id: ctx.user.sub,
      book_id: input.book_id,
    }
    const cart: Prisma.CartUncheckedCreateInput = {
      user_id: ctx.user.sub,
      book_id: input.book_id,
      quantity: currCart ? currCart.quantity + input.quantity : input.quantity,
    }

    await this.prisma.cart.upsert({
      where: {
        user_id_book_id: compoundId
      },
      create: cart,
      update: cart
    })
  }

  async getAll(ctx: RequestContext, input: CartListInput): Promise<CartListOutputDto> {
    this.logger.log(ctx, `${this.getAll.name} called`);

    const conditions = {};
    const orderBy = {};

    if (input.orderBy) {
      const [key, sort] = input.orderBy.split('__')
      orderBy[key] = sort || 'desc';
    }

    const totalData = await this.prisma.cart.count({
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

    const carts = await this.prisma.cart.findMany({
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      where: conditions,
      orderBy,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            price: true,
            cover_image: true,
          }
        }
      }
    });

    const cartsOutput = plainToInstance(CartListOutputDto, {
      carts,
      pagination,
    }, {
      excludeExtraneousValues: true,
    });

    return cartsOutput;
  }

  async remove(ctx: RequestContext, input: RemoveCartDto): Promise<void> {
    this.logger.log(ctx, `${this.remove.name} called`);

    const cart = await this.prisma.cart.findFirst({
      where: {
        user_id: ctx.user.sub,
        book_id: input.book_id,
      }
    });
    if (!cart) {
      throw new NotFoundException('Book not found on cart')
    }

    const compoundId: Prisma.CartUser_idBook_idCompoundUniqueInput = {
      user_id: ctx.user.sub,
      book_id: input.book_id,
    }
    await this.prisma.cart.delete({
      where: {
        user_id_book_id: compoundId,
      }
    });
  }
}
