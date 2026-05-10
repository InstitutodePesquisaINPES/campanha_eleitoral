import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    // @ts-ignore: IDE Prisma sync issue
    let profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      // Create empty profile if it doesn't exist
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');

      // @ts-ignore: IDE Prisma sync issue
      profile = await this.prisma.profile.create({
        data: {
          userId,
          fullName: user.email.split('@')[0],
        },
      });
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      cpf?: string;
      avatarUrl?: string;
    },
  ) {
    const profile = await this.getProfile(userId);
    // @ts-ignore: IDE Prisma sync issue
    return this.prisma.profile.update({
      where: { id: profile.id },
      data,
    });
  }
}
