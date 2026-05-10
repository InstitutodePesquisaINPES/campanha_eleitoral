import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateAgendaDto,
  UpdateAgendaDto,
  CreateParticipanteDto,
  UpdateParticipanteDto,
  CreateCheckinDto,
  CreateFollowupDto,
  UpdateFollowupDto,
} from './dto/agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- AGENDA ----
  async findAll(month: string | undefined, tenantId: string) {
    let whereClause: any = { tenantId };
    if (month) {
      const year = parseInt(month.split('-')[0]);
      const mon = parseInt(month.split('-')[1]);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59);
      whereClause = {
        ...whereClause,
        dataInicio: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    return this.prisma.agenda.findMany({
      where: whereClause,
      include: {
        creator: { select: { fullName: true } },
        responsavel: { select: { fullName: true } },
      },
      orderBy: { dataInicio: 'asc' },
      take: 500,
    });
  }

  async findOne(id: string, tenantId: string) {
    const evento = await this.prisma.agenda.findFirst({
      where: { id, tenantId },
      include: {
        participantes: { include: { pessoa: { select: { fullName: true } } } },
        responsavel: { select: { fullName: true } },
        checkins: true,
        followups: true,
      },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async create(data: CreateAgendaDto, userId: string, tenantId: string) {
    return this.prisma.agenda.create({
      data: {
        ...data,
        createdBy: userId,
        tenantId,
      },
    });
  }

  async update(id: string, data: UpdateAgendaDto, tenantId: string) {
    await this.findOne(id, tenantId); // Assert ownership
    return this.prisma.agenda.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Assert ownership
    return this.prisma.agenda.delete({
      where: { id },
    });
  }

  // ---- PARTICIPANTES ----
  async getParticipantes(agendaId: string) {
    return this.prisma.agendaParticipante.findMany({
      where: { agendaId },
      include: { pessoa: { select: { fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createParticipante(data: CreateParticipanteDto & { agendaId: string }) {
    return this.prisma.agendaParticipante.create({ data });
  }

  async updateParticipante(id: string, data: UpdateParticipanteDto) {
    return this.prisma.agendaParticipante.update({ where: { id }, data });
  }

  async deleteParticipante(id: string) {
    return this.prisma.agendaParticipante.delete({ where: { id } });
  }

  // ---- CHECKINS ----
  async getCheckins(agendaId: string) {
    return this.prisma.agendaCheckin.findMany({
      where: { agendaId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCheckin(
    data: CreateCheckinDto & { agendaId: string },
    userId: string,
  ) {
    return this.prisma.agendaCheckin.create({
      data: { ...data, usuarioId: userId },
    });
  }

  // ---- FOLLOWUPS ----
  async getFollowups(agendaId: string) {
    return this.prisma.agendaFollowup.findMany({
      where: { agendaId },
      orderBy: { prazo: 'asc' },
    });
  }

  async createFollowup(data: CreateFollowupDto & { agendaId: string }) {
    return this.prisma.agendaFollowup.create({ data });
  }

  async updateFollowup(id: string, data: UpdateFollowupDto) {
    return this.prisma.agendaFollowup.update({ where: { id }, data });
  }
}
