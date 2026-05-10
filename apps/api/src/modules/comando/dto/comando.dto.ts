import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateReuniaoDto {
  @IsString()
  titulo!: string;

  @IsDateString()
  dataReuniao!: string;

  @IsString()
  @IsOptional()
  pauta?: string;

  @IsString()
  @IsOptional()
  local?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  campanhaId?: string;
}

export class UpdateReuniaoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsDateString()
  @IsOptional()
  dataReuniao?: string;

  @IsString()
  @IsOptional()
  pauta?: string;

  @IsString()
  @IsOptional()
  local?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  campanhaId?: string;
}

export class CreateDeliberacaoDto {
  @IsString()
  reuniaoId!: string;

  @IsString()
  descricao!: string;

  @IsDateString()
  @IsOptional()
  prazo?: string;

  @IsString()
  @IsOptional()
  responsavelId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
