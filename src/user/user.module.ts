import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/helpers/prisma.service';
import { CartService } from 'src/cart/cart.service';
import { BookService } from 'src/book/book.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CartService, BookService, OrderService],
})
export class UserModule { }
