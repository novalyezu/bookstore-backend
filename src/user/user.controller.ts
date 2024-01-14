import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AppLogger } from 'src/helpers/logger.service';
import { AuthGuard } from 'src/helpers/auth.guard';
import { ApiErrorResponse, ApiResponseWrapper, SwaggerApiResponseWrapper } from 'src/dtos/api-response-wrapper.dto';
import { UserOutputDto } from './dto/user-output.dto';
import { ReqContext, RequestContext } from 'src/helpers/request-context.decorator';
import { STATUS } from 'src/constants/constant';
import { CartOutputDto } from 'src/cart/dto/cart-output.dto';
import { CartListInput } from 'src/cart/dto/cart-input.dto';
import { CartService } from 'src/cart/cart.service';
import { AddToCartDto } from 'src/cart/dto/create-cart.dto';
import { RemoveCartDto } from 'src/cart/dto/remove-cart.dto';
import { OrderOutputDto } from 'src/order/dto/order-output.dto';
import { OrderListInput } from 'src/order/dto/order-input.dto';
import { OrderService } from 'src/order/order.service';

@ApiBearerAuth()
@ApiTags('v1/me')
@Controller('v1/me')
export class UserController {
  constructor(
    private userService: UserService,
    private cartService: CartService,
    private orderService: OrderService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @UseGuards(AuthGuard)
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(UserOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'unauthorized request',
    type: ApiErrorResponse,
  })
  async getMe(
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponseWrapper<UserOutputDto>> {
    this.logger.log(ctx, `${this.getMe.name} called`);

    const user = await this.userService.getById(ctx, ctx.user.sub);
    return { status: STATUS.SUCCESS, data: user };
  }

  /**
   * Cart section
   */
  @UseGuards(AuthGuard)
  @Get('/carts')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(CartOutputDto),
  })
  async getCarts(
    @ReqContext() ctx: RequestContext,
    @Query() input: CartListInput,
  ): Promise<ApiResponseWrapper<CartOutputDto[]>> {
    this.logger.log(ctx, `${this.getCarts.name} called`);

    const data = await this.cartService.getAll(ctx, input);

    return { status: STATUS.SUCCESS, meta: data.pagination, data: data.carts };
  }

  @UseGuards(AuthGuard)
  @Post('/carts')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async addToCart(
    @ReqContext() ctx: RequestContext,
    @Body() input: AddToCartDto,
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.addToCart.name} called`);

    await this.cartService.addToCart(ctx, input);

    return { status: STATUS.SUCCESS, message: 'Added to cart', data: null };
  }

  @UseGuards(AuthGuard)
  @Delete('/carts')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async removeCart(
    @ReqContext() ctx: RequestContext,
    @Body() input: RemoveCartDto,
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.removeCart.name} called`);

    await this.cartService.remove(ctx, input);

    return { status: STATUS.SUCCESS, message: 'Removed from cart', data: null };
  }
  /**
   * Cart section
   */

  /**
   * Order section
   */
  @UseGuards(AuthGuard)
  @Get('/orders')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(OrderOutputDto),
  })
  async getOrders(
    @ReqContext() ctx: RequestContext,
    @Query() input: OrderListInput,
  ): Promise<ApiResponseWrapper<OrderOutputDto[]>> {
    this.logger.log(ctx, `${this.getOrders.name} called`);

    input.buyer_id = ctx.user.sub;
    const data = await this.orderService.getAll(ctx, input);

    return { status: STATUS.SUCCESS, meta: data.pagination, data: data.orders };
  }

  @UseGuards(AuthGuard)
  @Get('/orders/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(OrderOutputDto),
  })
  async getOrderById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string
  ): Promise<ApiResponseWrapper<OrderOutputDto>> {
    this.logger.log(ctx, `${this.getOrderById.name} called`);

    const order = await this.orderService.getById(ctx, id);
    if (order.buyer_id !== ctx.user.sub) {
      throw new NotFoundException('Order not found');
    }

    return { status: STATUS.SUCCESS, data: order };
  }
  /**
   * Order section
   */
}
