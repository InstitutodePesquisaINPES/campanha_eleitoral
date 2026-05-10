import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateTagDto, AddRoleDto } from './dto/admin.dto';
import { AppRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('audit')
  getAuditLogs(
    @Query('action') action: string,
    @Query('table') table: string,
    @Query('page') page: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.adminService.getAuditLogs(
      tenantId,
      action || 'all',
      table || '',
      parseInt(page) || 0,
    );
  }

  @Get('users')
  getUsers(@CurrentTenant() tenantId: string) {
    return this.adminService.getUsers(tenantId);
  }

  @Post('users/:id/roles')
  addRole(
    @Param('id') userId: string,
    @Body() body: AddRoleDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.adminService.addRole(tenantId, userId, body.role);
  }

  @Delete('users/:id/roles/:role')
  removeRole(
    @Param('id') userId: string,
    @Param('role') role: AppRole,
    @CurrentTenant() tenantId: string,
  ) {
    return this.adminService.removeRole(tenantId, userId, role);
  }

  @Post('seed-test-users')
  seedTestUsers() {
    return {
      status: 'mocked',
      message:
        'Seed de teste está desativado na nova arquitetura via API para segurança.',
    };
  }

  @Get('tags')
  getTags(@CurrentTenant() tenantId: string) {
    return this.adminService.getTags(tenantId);
  }

  @Post('tags')
  createTag(@Body() data: CreateTagDto, @CurrentTenant() tenantId: string) {
    return this.adminService.createTag(tenantId, data);
  }

  @Delete('tags/:id')
  removeTag(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.adminService.removeTag(tenantId, id);
  }
}
