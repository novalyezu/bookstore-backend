import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RemoveCartDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  book_id: string;
}