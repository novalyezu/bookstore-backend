import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/helpers/logger.service';
import { PrismaService } from 'src/helpers/prisma.service';
import { RequestContext, UserAccessToken } from 'src/helpers/request-context.decorator';
import { UserOutputDto } from 'src/user/dto/user-output.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto/auth-input.dto';
import { LoginOutputDto } from './dto/auth-output.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async generateToken(
    ctx: RequestContext,
    user: UserOutputDto,
  ): Promise<string> {
    const payload: UserAccessToken = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async register(
    ctx: RequestContext,
    input: RegisterDto,
  ): Promise<LoginOutputDto> {
    this.logger.log(ctx, `${this.register.name} called`);

    const user = await this.userService.create(ctx, input);
    const accessToken = await this.generateToken(ctx, user);

    return plainToInstance(
      LoginOutputDto,
      {
        ...user,
        access_token: accessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async login(ctx: RequestContext, input: LoginDto): Promise<LoginOutputDto> {
    this.logger.log(ctx, `${this.login.name} called`);

    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      }
    })
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const accessToken = await this.generateToken(ctx, user);

    return plainToInstance(
      LoginOutputDto,
      {
        ...user,
        access_token: accessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
