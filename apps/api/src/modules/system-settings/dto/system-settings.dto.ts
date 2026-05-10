import { IsObject, IsOptional } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
