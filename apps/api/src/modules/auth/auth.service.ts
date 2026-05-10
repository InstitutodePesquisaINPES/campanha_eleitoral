import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
    tenantSlug?: string,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email já cadastrado');
    }

    // Cria ou reutiliza o Tenant
    let tenant = tenantSlug
      ? await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } })
      : null;

    if (!tenant) {
      // Cria um novo Tenant para este usuário (Workspace padrão)
      const slug = tenantSlug || `ws-${email.split('@')[0]}-${Date.now()}`;
      tenant = await this.prisma.tenant.create({
        data: { name: fullName || email, slug },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        tenantId: tenant.id,
      },
      select: { id: true, email: true, fullName: true, tenantId: true },
    });

    // Assign default role
    await this.prisma.userRole.create({
      data: { userId: user.id, role: 'admin', tenantId: tenant.id },
    });

    const token = this.generateToken(user.id, user.email, tenant.id);
    return { token, user, tenant };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tenantId = user.tenantId;
    const token = this.generateToken(user.id, user.email, tenantId);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        cpf: true,
        avatarUrl: true,
        tenantId: true,
        roles: { select: { role: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
  }

  private generateToken(
    userId: string,
    email: string,
    tenantId: string | null,
  ): string {
    return this.jwt.sign({ sub: userId, email, tenantId });
  }
}
