import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateCampanhaDto {
  @IsString()
  nome!: string;

  @IsString()
  cargo!: string;

  @IsNumber()
  ano!: number;

  @IsNumber()
  @IsOptional()
  metaVotos?: number;

  @IsNumber()
  @IsOptional()
  orcamentoGlobal?: number;

  @IsDateString()
  @IsOptional()
  dataEleicao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  abrangencia?: string;

  @IsUUID()
  @IsOptional()
  estadoId?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  parentCampanhaId?: string;
}

export class UpdateCampanhaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsNumber()
  @IsOptional()
  ano?: number;

  @IsNumber()
  @IsOptional()
  metaVotos?: number;

  @IsNumber()
  @IsOptional()
  orcamentoGlobal?: number;

  @IsDateString()
  @IsOptional()
  dataEleicao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  abrangencia?: string;

  @IsUUID()
  @IsOptional()
  estadoId?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  parentCampanhaId?: string;
}

export class CreateEixoDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  cor?: string;

  @IsNumber()
  @IsOptional()
  orcamentoAlocado?: number;
}

export class UpdateEixoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  cor?: string;

  @IsNumber()
  @IsOptional()
  orcamentoAlocado?: number;
}

export class CreatePlanoAcaoDto {
  @IsString()
  titulo!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsDateString()
  @IsOptional()
  dataConclusao?: string;

  @IsNumber()
  @IsOptional()
  orcamentoPrevisto?: number;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsUUID()
  @IsOptional()
  dependeDeId?: string;
}

export class UpdatePlanoAcaoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsDateString()
  @IsOptional()
  dataConclusao?: string;

  @IsNumber()
  @IsOptional()
  orcamentoPrevisto?: number;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsUUID()
  @IsOptional()
  dependeDeId?: string;
}

export class CreateParceriaDto {
  @IsString()
  candidatoParceiroNome!: string;

  @IsString()
  cargoParceiro!: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsNumber()
  @IsOptional()
  pesoEstrategico?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
