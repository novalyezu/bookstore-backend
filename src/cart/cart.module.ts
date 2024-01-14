import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { BookService } from 'src/book/book.service';
import { PrismaService } from 'src/helpers/prisma.service';

@Module({
  controllers: [],
  providers: [CartService, PrismaService, BookService],
})
export class CartModule { }
