import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateCampanhaDto {
  @IsString()
  nome: string;

  @IsString()
  cargo: string;

  @IsString()
  @IsOptional()
  partidoSigla?: string;

  @IsString()
  @IsOptional()
  numeroUrna?: string;

  @IsString()
  @IsOptional()
  coligacao?: string;

  @IsString()
  @IsOptional()
  estadoId?: string;

  @IsString()
  @IsOptional()
  municipioId?: string;

  @IsArray()
  @IsOptional()
  municipiosFocoIds?: string[];

  @IsDateString()
  @IsOptional()
  dataEleicao?: string | Date;

  @IsDateString()
  @IsOptional()
  dataInicioPlano?: string | Date;

  @IsInt()
  @IsOptional()
  metaVotos?: number;

  @IsNumber()
  @IsOptional()
  orcamentoTotal?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;

  @IsString()
  @IsOptional()
  candidatoPessoaId?: string;
}

export class UpdateCampanhaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  partidoSigla?: string;

  @IsString()
  @IsOptional()
  numeroUrna?: string;

  @IsString()
  @IsOptional()
  coligacao?: string;

  @IsString()
  @IsOptional()
  estadoId?: string;

  @IsString()
  @IsOptional()
  municipioId?: string;

  @IsArray()
  @IsOptional()
  municipiosFocoIds?: string[];

  @IsDateString()
  @IsOptional()
  dataEleicao?: string | Date;

  @IsDateString()
  @IsOptional()
  dataInicioPlano?: string | Date;

  @IsInt()
  @IsOptional()
  metaVotos?: number;

  @IsNumber()
  @IsOptional()
  orcamentoTotal?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;

  @IsString()
  @IsOptional()
  candidatoPessoaId?: string;
}

export class CreateTarefaDto {
  @IsString()
  @IsOptional()
  faseId?: string;

  @IsString()
  @IsOptional()
  oQueE?: string;

  @IsString()
  @IsOptional()
  oQueFaz?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  entregaveis?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsInt()
  @IsOptional()
  dia?: number;

  @IsInt()
  @IsOptional()
  ordem?: number;

  @IsBoolean()
  @IsOptional()
  isMarco?: boolean;

  @IsDateString()
  @IsOptional()
  dataPrevista?: string | Date;

  @IsDateString()
  @IsOptional()
  dataConclusao?: string | Date;

  @IsString()
  @IsOptional()
  faseLegal?: string;

  @IsBoolean()
  @IsOptional()
  permitidoAntesRegistro?: boolean;

  @IsString()
  @IsOptional()
  respaldoLegal?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class UpdateTarefaDto {
  @IsString()
  @IsOptional()
  faseId?: string;

  @IsString()
  @IsOptional()
  oQueE?: string;

  @IsString()
  @IsOptional()
  oQueFaz?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  entregaveis?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsInt()
  @IsOptional()
  dia?: number;

  @IsInt()
  @IsOptional()
  ordem?: number;

  @IsBoolean()
  @IsOptional()
  isMarco?: boolean;

  @IsDateString()
  @IsOptional()
  dataPrevista?: string | Date;

  @IsDateString()
  @IsOptional()
  dataConclusao?: string | Date;

  @IsString()
  @IsOptional()
  faseLegal?: string;

  @IsBoolean()
  @IsOptional()
  permitidoAntesRegistro?: boolean;

  @IsString()
  @IsOptional()
  respaldoLegal?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class CreateMetaDto {
  @IsString()
  nome: string;

  @IsString()
  indicador: string;

  @IsNumber()
  valorAlvo: number;

  @IsNumber()
  @IsOptional()
  valorAtual?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsDateString()
  @IsOptional()
  dataPrazo?: string | Date;
}

export class UpdateMetaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  indicador?: string;

  @IsNumber()
  @IsOptional()
  valorAlvo?: number;

  @IsNumber()
  @IsOptional()
  valorAtual?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsDateString()
  @IsOptional()
  dataPrazo?: string | Date;
}

export class CreateSemanaDto {
  @IsInt()
  numero: number;

  @IsDateString()
  dataInicio: string | Date;

  @IsDateString()
  dataFim: string | Date;

  @IsString()
  @IsOptional()
  foco?: string;
}

export class UpdateSemanaDto {
  @IsInt()
  @IsOptional()
  numero?: number;

  @IsDateString()
  @IsOptional()
  dataInicio?: string | Date;

  @IsDateString()
  @IsOptional()
  dataFim?: string | Date;

  @IsString()
  @IsOptional()
  foco?: string;
}
