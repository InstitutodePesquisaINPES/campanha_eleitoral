import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class UpdateMunicipioStrategyDto {
  @IsString()
  @IsOptional()
  classificacao_estrategica?: string;

  @IsNumber()
  @IsOptional()
  prioridade_campanha?: number;

  @IsString()
  @IsOptional()
  notas_estrategicas?: string;
}

export class CreateBairroDto {
  @IsString()
  nome: string;

  @IsString()
  municipio_id: string;

  @IsString()
  @IsOptional()
  zona_estrategica?: string;

  @IsString()
  @IsOptional()
  perfil_socioeconomico?: string;
}

export class ImportBairrosDto {
  @IsString()
  municipioId: string;

  @IsArray()
  @IsString({ each: true })
  nomes: string[];
}

export class CreateMapaCenarioDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  campanhaId?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  dadosGeo?: unknown[];
}

export class CreateMapaSetorDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  campanhaId?: string;

  @IsObject()
  @IsOptional()
  limitesGeo?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  cor?: string;
}

export class UpdateMapaSetorDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsObject()
  @IsOptional()
  limitesGeo?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  cor?: string;
}
