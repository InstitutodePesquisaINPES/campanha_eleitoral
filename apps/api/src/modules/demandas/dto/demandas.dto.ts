import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateDemandaDto {
  @IsString()
  titulo!: string;

  @IsUUID()
  @IsOptional()
  pessoaId?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsString()
  @IsOptional()
  protocolo?: string;

  @IsNumber()
  @IsOptional()
  satisfacaoCidadao?: number;

  @IsString()
  @IsOptional()
  resolucaoDescricao?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  bairroId?: string;

  @IsUUID()
  @IsOptional()
  eixoId?: string;

  @IsUUID()
  @IsOptional()
  atribuidoA?: string;

  @IsDateString()
  @IsOptional()
  dataPrazo?: string;

  @IsDateString()
  @IsOptional()
  dataResolucao?: string;
}

export class UpdateDemandaDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsUUID()
  @IsOptional()
  pessoaId?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsString()
  @IsOptional()
  protocolo?: string;

  @IsNumber()
  @IsOptional()
  satisfacaoCidadao?: number;

  @IsString()
  @IsOptional()
  resolucaoDescricao?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  bairroId?: string;

  @IsUUID()
  @IsOptional()
  eixoId?: string;

  @IsUUID()
  @IsOptional()
  atribuidoA?: string;

  @IsDateString()
  @IsOptional()
  dataPrazo?: string;

  @IsDateString()
  @IsOptional()
  dataResolucao?: string;
}

export class CreateEncaminhamentoDto {
  @IsUUID()
  @IsOptional()
  paraUsuarioId?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}

export class CreateAnexoDto {
  @IsString()
  arquivoUrl!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  tipo?: string;
}
