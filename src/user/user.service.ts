import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/helpers/prisma.service';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { Prisma } from '@prisma/client';
import { UserOutputDto } from './dto/user-output.dto';
import { plainToInstance } from 'class-transformer';
import { AppLogger } from 'src/helpers/logger.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  async validateEmail(ctx: RequestContext, email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      }
    })
    if (user) {
      throw new BadRequestException('Email already exists');
    }
  }

  async create(ctx: RequestContext, input: CreateUserDto): Promise<UserOutputDto> {
    this.logger.log(ctx, `${this.create.name} called`);

    await this.validateEmail(ctx, input.email);

    const hashPassword = await bcrypt.hash(input.password, 10);
    const user: Prisma.UserCreateInput = {
      id: uuidV4(),
      email: input.email,
      name: input.name,
      password: hashPassword,
    }
    const createdUser = await this.prisma.user.create({
      data: user,
    });

    return plainToInstance(
      UserOutputDto,
      createdUser,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getById(ctx: RequestContext, userId: string): Promise<UserOutputDto> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const userData = plainToInstance(
      UserOutputDto,
      user,
      {
        excludeExtraneousValues: true,
      },
    );

    return userData;
  }
}
