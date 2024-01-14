import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { AddToCartDto } from "src/cart/dto/create-cart.dto";

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buyer_id: string

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => AddToCartDto)
  carts: AddToCartDto[]

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shipping_name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shipping_phone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shipping_address: string
}
