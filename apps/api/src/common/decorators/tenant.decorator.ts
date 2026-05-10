import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator que extrai o tenantId da requisição autenticada.
 * Uso nos controllers: @CurrentTenant() tenantId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId as string;
  },
);

/**
 * Decorator que extrai o userId (sub) da requisição autenticada.
 * Uso nos controllers: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub as string;
  },
);
