import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CurrentTenant,
  CurrentUser,
} from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.settingsService.findAll(tenantId);
  }

  @Patch()
  updateMany(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() settings: Record<string, any>,
  ) {
    return this.settingsService.updateMany(tenantId, settings, userId);
  }
}
