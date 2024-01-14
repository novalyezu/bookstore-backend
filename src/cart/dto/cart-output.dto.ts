import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BookOutputDto } from 'src/book/dto/book-output.dto';
import { PaginationResponseDto } from 'src/dtos/pagination-response.dto';

export class CartOutputDto {
  @ApiProperty()
  @Expose()
  book_id: string

  @ApiProperty()
  @Expose()
  @Type(() => BookOutputDto)
  book: BookOutputDto[]

  @ApiProperty()
  @Expose()
  quantity: number
}

export class CartListOutputDto {
  @Expose()
  @ApiProperty()
  @Type(() => CartOutputDto)
  carts: CartOutputDto[];

  @Expose()
  @ApiProperty()
  pagination: PaginationResponseDto;
}