import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  synopsis: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  author: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publisher: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publish_date: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  pages: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  quantity: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  price: number

  @ApiProperty({
    description: 'allow file type: jpg, jpeg, png. max size 2mb',
  })
  cover_image_file?: Express.Multer.File;
}
