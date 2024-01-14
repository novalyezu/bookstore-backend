import { Expose } from 'class-transformer';
import { UserOutputDto } from 'src/user/dto/user-output.dto';

export class LoginOutputDto extends UserOutputDto {
  @Expose()
  access_token: string;
}
