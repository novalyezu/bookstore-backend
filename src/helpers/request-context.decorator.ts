import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UserAccessToken {
  sub: string;
  email: string;
  role: string;
}

export class RequestContext {
  requestId: string;
  user: UserAccessToken;
}

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const req = ctx.switchToHttp().getRequest();
    const reqCtx = new RequestContext();
    reqCtx.requestId = req.headers['requestId'];
    reqCtx.user = {
      sub: req.user?.sub,
      email: req.user?.email,
      role: req.user?.role,
    };
    return reqCtx;
  },
);
