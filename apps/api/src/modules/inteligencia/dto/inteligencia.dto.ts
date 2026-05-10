import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean } from 'class-validator';

export class UpsertLiderancaDto {
  @IsUUID()
  @IsOptional()
  campanhaId?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  bairroId?: string;

  @IsUUID()
  @IsOptional()
  pessoaId?: string;

  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  classificacao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsNumber()
  @IsOptional()
  votosEstimados?: number;

  @IsNumber()
  @IsOptional()
  influenciaScore?: number;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class UpdateVereadorDto {
  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  partido?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsNumber()
  @IsOptional()
  ano?: number;

  @IsBoolean()
  @IsOptional()
  eleito?: boolean;

  @IsNumber()
  @IsOptional()
  votosRecebidos?: number;

  @IsString()
  @IsOptional()
  faixaVotos?: string;

  @IsNumber()
  @IsOptional()
  votosUltimaEleicao?: number;

  @IsString()
  @IsOptional()
  alinhamento?: string;
}
