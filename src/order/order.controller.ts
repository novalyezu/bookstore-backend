import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus, HttpCode, Query, Patch, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/helpers/auth.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseWrapper, SwaggerApiResponseWrapper } from 'src/dtos/api-response-wrapper.dto';
import { ReqContext, RequestContext } from 'src/helpers/request-context.decorator';
import { AppLogger } from 'src/helpers/logger.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { STATUS } from 'src/constants/constant';
import { Role } from '@prisma/client';
import { Roles } from 'src/helpers/roles.decorator';
import { OrderOutputDto } from './dto/order-output.dto';
import { OrderListInput } from './dto/order-input.dto';
import { UpdateOrderDto, UpdateStatusDto } from './dto/update-order.dto';

@ApiBearerAuth()
@ApiTags('v1/orders')
@Controller('v1/orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(OrderController.name);
  }

  @UseGuards(AuthGuard)
  @Post('')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async createOrder(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateOrderDto,
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.createOrder.name} called`);

    if (ctx.user.role === Role.ADMIN) {
      await this.orderService.adminOrder(ctx, input);
    }
    if (ctx.user.role === Role.USER) {
      await this.orderService.userOrder(ctx, input);
    }

    return { status: STATUS.SUCCESS, message: 'Order created', data: null };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(OrderOutputDto),
  })
  async getAll(
    @ReqContext() ctx: RequestContext,
    @Query() input: OrderListInput,
  ): Promise<ApiResponseWrapper<OrderOutputDto[]>> {
    this.logger.log(ctx, `${this.getAll.name} called`);

    const data = await this.orderService.getAll(ctx, input);

    return { status: STATUS.SUCCESS, meta: data.pagination, data: data.orders };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(OrderOutputDto),
  })
  async getById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string
  ): Promise<ApiResponseWrapper<OrderOutputDto>> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const order = await this.orderService.getById(ctx, id);

    return { status: STATUS.SUCCESS, data: order };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async updateOrder(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() input: UpdateOrderDto,
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.updateOrder.name} called`);

    await this.orderService.updateOrder(ctx, id, input);

    return { status: STATUS.SUCCESS, message: 'Order updated', data: null };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async updateStatus(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() input: UpdateStatusDto,
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.updateStatus.name} called`);

    await this.orderService.updateStatus(ctx, id, input);

    return { status: STATUS.SUCCESS, message: 'Order updated', data: null };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(String),
  })
  async remove(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.remove.name} called`);

    await this.orderService.remove(ctx, id);

    return { status: STATUS.SUCCESS, message: 'Order deleted', data: null };
  }

}
