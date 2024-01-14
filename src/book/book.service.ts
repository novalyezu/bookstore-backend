import { v4 as uuidV4 } from 'uuid';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/helpers/prisma.service';
import { AppLogger } from 'src/helpers/logger.service';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { BookListOutputDto, BookOutputDto } from './dto/book-output.dto';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { BookListInput } from './dto/book-input.dto';
import { FileService } from 'src/helpers/file.service';

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(BookService.name);
  }
  private BOOK_DEST = '/books/';

  async create(ctx: RequestContext, input: CreateBookDto): Promise<BookOutputDto> {
    this.logger.log(ctx, `${this.create.name} called`);

    const cover_image = await this.fileService.upload(ctx, input.cover_image_file, this.BOOK_DEST);

    const book: Prisma.BookCreateInput = {
      id: uuidV4(),
      title: input.title,
      synopsis: input.synopsis,
      author: input.author,
      publisher: input.publisher,
      publish_date: input.publish_date,
      pages: input.pages,
      quantity: input.quantity,
      price: input.price,
      cover_image: cover_image,
    }
    const createdBook = await this.prisma.book.create({
      data: book,
    });

    return plainToInstance(
      BookOutputDto,
      createdBook,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getAll(ctx: RequestContext, input: BookListInput): Promise<BookListOutputDto> {
    this.logger.log(ctx, `${this.getAll.name} called`);

    const conditions = {};
    const orderBy = {};

    if (input.search) {
      conditions['OR'] = [
        {
          title: {
            search: input.search
          }
        },
        {
          synopsis: {
            search: input.search
          }
        },
        {
          author: {
            search: input.search
          }
        }
      ]
    }

    if (input.orderBy) {
      const [key, sort] = input.orderBy.split('__')
      orderBy[key] = sort || 'desc';
    }

    const totalData = await this.prisma.book.count({
      where: conditions,
    });
    const totalPage = Math.ceil(totalData / input.limit);
    const page = input.page;

    const pagination = {
      currentPage: page,
      nextPage: (totalPage > page) ? page + 1 : null,
      prevPage: (page > 1) ? page - 1 : null,
      totalData: totalData,
      totalPage: totalPage,
    }

    const books = await this.prisma.book.findMany({
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      where: conditions,
      orderBy,
    });

    const booksOutput = plainToInstance(BookListOutputDto, {
      books,
      pagination,
    }, {
      excludeExtraneousValues: true,
    });

    return booksOutput;
  }

  async getById(ctx: RequestContext, bookId: string): Promise<BookOutputDto> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const book = await this.prisma.book.findFirst({
      where: {
        id: bookId
      }
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const bookOutput = plainToInstance(BookOutputDto, book, {
      excludeExtraneousValues: true,
    });

    return bookOutput;
  }

  async update(ctx: RequestContext, bookId: string, input: UpdateBookDto): Promise<BookOutputDto> {
    this.logger.log(ctx, `${this.update.name} called`);

    const book = await this.getById(ctx, bookId);
    let cover_image = book.cover_image;

    if (input.cover_image_file) {
      cover_image = await this.fileService.upload(ctx, input.cover_image_file, this.BOOK_DEST);
    }

    const updateBook: Prisma.BookUpdateInput = {
      title: input.title,
      synopsis: input.synopsis,
      author: input.author,
      publisher: input.publisher,
      publish_date: input.publish_date,
      pages: input.pages,
      quantity: input.quantity,
      price: input.price,
      cover_image: cover_image,
    }
    const updatedBook = await this.prisma.book.update({
      data: updateBook,
      where: {
        id: bookId,
      }
    });

    if (input.cover_image_file) {
      await this.fileService.remove(ctx, book.cover_image, 'image');
    }

    return plainToInstance(
      BookOutputDto,
      updatedBook,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async remove(ctx: RequestContext, bookId: string): Promise<void> {
    this.logger.log(ctx, `${this.remove.name} called`);

    const book = await this.getById(ctx, bookId)

    await this.prisma.book.delete({
      where: {
        id: bookId,
      }
    });

    await this.fileService.remove(ctx, book.cover_image, 'image');
  }
}
