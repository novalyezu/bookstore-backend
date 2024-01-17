import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto extends CreateOrderDto { }

export class UpdateStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  order_status: OrderStatus;
}