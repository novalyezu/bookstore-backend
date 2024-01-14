import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'src/helpers/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, UserService],
})
export class OrderModule { }
