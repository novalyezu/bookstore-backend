import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PaginationResponseDto {
  @Expose()
  @ApiProperty()
  currentPage: number;

  @Expose()
  @ApiProperty()
  nextPage: number;

  @Expose()
  @ApiProperty()
  prevPage: number;

  @Expose()
  @ApiProperty()
  totalData: number;

  @Expose()
  @ApiProperty()
  totalPage: number;
}
