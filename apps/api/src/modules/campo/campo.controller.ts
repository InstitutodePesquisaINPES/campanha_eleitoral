import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CampoService } from './campo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateRoteiroDto } from './dto/campo.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('campo')
export class CampoController {
  constructor(private readonly campoService: CampoService) {}

  @Get('roteiros')
  getRoteiros(@CurrentTenant() tenantId: string) {
    return this.campoService.getRoteiros(tenantId);
  }

  @Post('roteiros')
  createRoteiro(
    @Body() data: CreateRoteiroDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.campoService.createRoteiro(data, tenantId);
  }

  @Put('roteiros/:id/status')
  updateRoteiroStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.campoService.updateRoteiroStatus(id, status, tenantId);
  }
}
