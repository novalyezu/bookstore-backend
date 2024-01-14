import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationResponseDto } from 'src/dtos/pagination-response.dto';

export class BookOutputDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string

  @ApiProperty()
  @Expose()
  synopsis: string

  @ApiProperty()
  @Expose()
  author: string

  @ApiProperty()
  @Expose()
  publisher: string

  @ApiProperty()
  @Expose()
  publish_date: string

  @ApiProperty()
  @Expose()
  pages: number

  @ApiProperty()
  @Expose()
  quantity: number

  @ApiProperty()
  @Expose()
  price: number

  @ApiProperty()
  @Expose()
  cover_image: string

  @ApiProperty()
  @Expose()
  createdAt: Date
}

export class BookListOutputDto {
  @Expose()
  @ApiProperty()
  @Type(() => BookOutputDto)
  books: BookOutputDto[];

  @Expose()
  @ApiProperty()
  pagination: PaginationResponseDto;
}