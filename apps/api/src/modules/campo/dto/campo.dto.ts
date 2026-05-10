import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateRoteiroDto {
  @IsString()
  nome!: string;

  @IsDateString()
  data!: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateRoteiroDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsDateString()
  @IsOptional()
  data?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
