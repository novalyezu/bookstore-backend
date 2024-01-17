import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationResponseDto } from 'src/dtos/pagination-response.dto';

export class OrderItemOutputDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  book_id: string

  @ApiProperty()
  @Expose()
  book_title: string

  @ApiProperty()
  @Expose()
  book_synopsis: string

  @ApiProperty()
  @Expose()
  book_author: string

  @ApiProperty()
  @Expose()
  book_publisher: string

  @ApiProperty()
  @Expose()
  book_publish_date: string

  @ApiProperty()
  @Expose()
  book_pages: number

  @ApiProperty()
  @Expose()
  book_price: number

  @ApiProperty()
  @Expose()
  book_cover_image: string

  @ApiProperty()
  @Expose()
  quantity: number

  @ApiProperty()
  @Expose()
  total_amount: number

  @ApiProperty()
  @Expose()
  createdAt: Date
}

export class OrderOutputDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  buyer_id: string

  @ApiProperty()
  @Expose()
  buyer_name: string

  @ApiProperty()
  @Expose()
  buyer_email: string

  @ApiProperty()
  @Expose()
  shipping_name: string

  @ApiProperty()
  @Expose()
  shipping_phone: string

  @ApiProperty()
  @Expose()
  shipping_address: string

  @ApiProperty()
  @Expose()
  total_quantity: number

  @ApiProperty()
  @Expose()
  total_amount: number

  @ApiProperty()
  @Expose()
  order_status: string

  @ApiProperty()
  @Expose()
  order_item_count: number

  @ApiProperty()
  @Expose()
  @Type(() => OrderItemOutputDto)
  order_items: OrderItemOutputDto[]

  @ApiProperty()
  @Expose()
  createdAt: Date
}

export class OrderListOutputDto {
  @Expose()
  @ApiProperty()
  @Type(() => OrderOutputDto)
  orders: OrderOutputDto[];

  @Expose()
  @ApiProperty()
  pagination: PaginationResponseDto;
}