import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpsertPesquisaDto {
  @IsString()
  titulo!: string;

  @IsString()
  @IsOptional()
  instituto?: string;

  @IsDateString()
  @IsOptional()
  dataDivulgacao?: string;
}

export class UpsertResultadoDto {
  @IsString()
  pesquisaId!: string;

  @IsString()
  candidato!: string;

  @IsString()
  @IsOptional()
  cenario?: string;

  @IsNumber()
  intencaoVotos!: number;
}

export class UpsertDoadorDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  cpfCnpj?: string;

  @IsNumber()
  @IsOptional()
  valorDoado?: number;

  @IsDateString()
  @IsOptional()
  dataDoacao?: string;

  @IsString()
  @IsOptional()
  statusDoacao?: string;
}
