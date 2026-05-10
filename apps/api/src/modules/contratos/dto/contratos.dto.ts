import { IsString, IsOptional, IsEnum } from 'class-validator';

export class DecidirAprovacaoDto {
  @IsString()
  status!: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}
