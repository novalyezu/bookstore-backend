import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppLogger } from 'src/helpers/logger.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse, ApiResponseWrapper, SwaggerApiResponseWrapper } from 'src/dtos/api-response-wrapper.dto';
import { LoginOutputDto } from './dto/auth-output.dto';
import { ReqContext, RequestContext } from 'src/helpers/request-context.decorator';
import { LoginDto, RegisterDto } from './dto/auth-input.dto';
import { STATUS } from 'src/constants/constant';

@ApiTags('v1/auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerApiResponseWrapper(LoginOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'error email already exists',
    type: ApiErrorResponse,
  })
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterDto,
  ): Promise<ApiResponseWrapper<LoginOutputDto>> {
    this.logger.log(ctx, `${this.register.name} called`);

    const data = await this.authService.register(ctx, input);
    return { status: STATUS.SUCCESS, data: data };
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(LoginOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'error email or password is wrong',
    type: ApiErrorResponse,
  })
  async login(
    @ReqContext() ctx: RequestContext,
    @Body() input: LoginDto,
  ): Promise<ApiResponseWrapper<LoginOutputDto>> {
    this.logger.log(ctx, `${this.login.name} called`);

    const data = await this.authService.login(ctx, input);
    return { status: STATUS.SUCCESS, data: data };
  }
}
