import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  tipo?: string;
}

export class CreateEstoqueDto {
  @IsString()
  materialId!: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsNumber()
  quantidadeAtual!: number;
}

export class CreateMovimentacaoDto {
  @IsString()
  estoqueId!: string;

  @IsString()
  tipo!: string;

  @IsNumber()
  quantidade!: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}
