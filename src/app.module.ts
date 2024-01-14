import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './helpers/all-exception.filter';
import { LoggerModule } from './helpers/logger.module';
import { ConfigModule } from '@nestjs/config';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';
import { BookModule } from './book/book.module';
import { FileModule } from './helpers/file.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

const configureJwtModule = () => {
  return JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '7d' },
  });
};

const configureFileModule = () => {
  return FileModule.register({
    bucket: process.env.CLOUDINARY_BUCKET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  });
};

const AllExceptionsFilterProvider = {
  provide: APP_FILTER,
  useClass: AllExceptionsFilter,
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule,
    configureJwtModule(),
    configureFileModule(),
    UserModule,
    AuthModule,
    BookModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilterProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
