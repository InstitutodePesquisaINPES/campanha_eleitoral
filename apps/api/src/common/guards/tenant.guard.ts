import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * TenantGuard — deve ser usado JUNTO ao JwtAuthGuard.
 * Garante que o token JWT carregue um tenantId válido.
 * Uso:  @UseGuards(JwtAuthGuard, TenantGuard)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException(
        'Acesso negado: sem contexto de Tenant. Faça login novamente.',
      );
    }

    // Injeta tenantId diretamente na request para uso nos services
    request.tenantId = user.tenantId;
    return true;
  }
}
