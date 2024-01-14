import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CartListInput {
  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderBy: string;

  @Expose()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page = 1;

  @Expose()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit = 10;
}