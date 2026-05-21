import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentPortalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest()['portalUser'];
  },
);
