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

  async register(email: string, password: string, fullName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, fullName },
      select: { id: true, email: true, fullName: true },
    });

    // Assign default role
    await this.prisma.userRole.create({
      data: { userId: user.id, role: 'visualizador' },
    });

    const token = this.generateToken(user.id, user.email);
    return { token, user };
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

    const token = this.generateToken(user.id, user.email);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
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
        roles: { select: { role: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwt.sign({ sub: userId, email });
  }
}
