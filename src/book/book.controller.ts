import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, HttpCode, HttpStatus, UploadedFile, ParseFilePipeBuilder, Query, Put, BadRequestException } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from 'src/helpers/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse, ApiResponseWrapper, SwaggerApiResponseWrapper } from 'src/dtos/api-response-wrapper.dto';
import { BookOutputDto } from './dto/book-output.dto';
import { ReqContext, RequestContext } from 'src/helpers/request-context.decorator';
import { STATUS } from 'src/constants/constant';
import { AppLogger } from 'src/helpers/logger.service';
import { BookListInput } from './dto/book-input.dto';
import { Roles } from 'src/helpers/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('v1/books')
@Controller('v1/books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(BookController.name);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('cover_image_file'))
  @Post('')
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(BookOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'unauthorized request',
    type: ApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateBookDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    cover_image_file?: Express.Multer.File,
  ): Promise<ApiResponseWrapper<BookOutputDto>> {
    this.logger.log(ctx, `${this.create.name} called`);

    if (!cover_image_file) {
      throw new BadRequestException('cover_image_file should not be empty')
    }

    input.cover_image_file = cover_image_file;
    const book = await this.bookService.create(ctx, input);
    return { status: STATUS.SUCCESS, data: book };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(BookOutputDto),
  })
  async getAll(
    @ReqContext() ctx: RequestContext,
    @Query() input: BookListInput,
  ): Promise<ApiResponseWrapper<BookOutputDto[]>> {
    this.logger.log(ctx, `${this.getAll.name} called`);

    const data = await this.bookService.getAll(ctx, input);

    return { status: STATUS.SUCCESS, meta: data.pagination, data: data.books };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(BookOutputDto),
  })
  async getById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string
  ): Promise<ApiResponseWrapper<BookOutputDto>> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const book = await this.bookService.getById(ctx, id);

    return { status: STATUS.SUCCESS, data: book };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('cover_image_file'))
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(BookOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'unauthorized request',
    type: ApiErrorResponse,
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() input: UpdateBookDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    cover_image_file?: Express.Multer.File,
  ): Promise<ApiResponseWrapper<BookOutputDto>> {
    this.logger.log(ctx, `${this.update.name} called`);

    input.cover_image_file = cover_image_file;
    const book = await this.bookService.update(ctx, id, input);
    return { status: STATUS.SUCCESS, data: book };
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(BookOutputDto),
  })
  async remove(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string
  ): Promise<ApiResponseWrapper<string>> {
    this.logger.log(ctx, `${this.remove.name} called`);

    await this.bookService.remove(ctx, id);

    return { status: STATUS.SUCCESS, message: 'Book deleted', data: null };
  }
}
