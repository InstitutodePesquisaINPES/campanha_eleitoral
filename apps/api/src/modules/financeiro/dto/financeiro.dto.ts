import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateCentroCustoDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  orcamentoPrevisto?: number;
}

export class CreateDespesaDto {
  @IsString()
  descricao!: string;

  @IsNumber()
  valor!: number;

  @IsDateString()
  dataDespesa!: string;

  @IsString()
  categoria!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  centroCustoId?: string;

  @IsUUID()
  @IsOptional()
  fornecedorId?: string;

  @IsString()
  @IsOptional()
  documentoTipo?: string;

  @IsString()
  @IsOptional()
  documentoNumero?: string;

  @IsString()
  @IsOptional()
  comprovanteUrl?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsUUID()
  @IsOptional()
  planoAcaoId?: string;

  @IsUUID()
  @IsOptional()
  aprovadorId?: string;

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;
}

export class UpdateDespesaDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsDateString()
  @IsOptional()
  dataDespesa?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  centroCustoId?: string;

  @IsUUID()
  @IsOptional()
  fornecedorId?: string;

  @IsString()
  @IsOptional()
  documentoTipo?: string;

  @IsString()
  @IsOptional()
  documentoNumero?: string;

  @IsString()
  @IsOptional()
  comprovanteUrl?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsUUID()
  @IsOptional()
  planoAcaoId?: string;

  @IsUUID()
  @IsOptional()
  aprovadorId?: string;

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;
}

export class CreateReceitaDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  valor!: number;

  @IsDateString()
  dataReceita!: string;

  @IsString()
  tipo!: string;

  @IsUUID()
  @IsOptional()
  centroCustoId?: string;

  @IsUUID()
  @IsOptional()
  origemPessoaId?: string;

  @IsString()
  @IsOptional()
  comprovanteUrl?: string;
}
