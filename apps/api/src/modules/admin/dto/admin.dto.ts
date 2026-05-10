import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AppRole } from '@prisma/client';

export class CreateTagDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  cor?: string;
}

export class AddRoleDto {
  @IsEnum(AppRole)
  role!: AppRole;
}
