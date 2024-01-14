import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { RequestContext } from './request-context.decorator';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  context: string;

  setContext(context: string): void {
    this.context = context;
  }

  error(ctx: RequestContext, message: string) {
    const timestamp = new Date().toISOString();
    console.error(
      `${timestamp}:`,
      JSON.stringify(ctx),
      `${this.context} - ${message}`,
    );
  }

  warn(ctx: RequestContext, message: string) {
    const timestamp = new Date().toISOString();
    console.warn(
      `${timestamp}:`,
      JSON.stringify(ctx),
      `${this.context} - ${message}`,
    );
  }

  debug(ctx: RequestContext, message: string) {
    const timestamp = new Date().toISOString();
    console.debug(
      `${timestamp}:`,
      JSON.stringify(ctx),
      `${this.context} - ${message}`,
    );
  }

  log(ctx: RequestContext, message: string) {
    const timestamp = new Date().toISOString();
    console.log(
      `${timestamp}:`,
      JSON.stringify(ctx),
      `${this.context} - ${message}`,
    );
  }
}
