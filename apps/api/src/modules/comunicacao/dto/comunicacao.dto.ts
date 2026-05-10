import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreatePautaDto {
  @IsUUID()
  @IsOptional()
  campanhaId?: string;

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
  dataPrevista?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdatePautaDto {
  @IsUUID()
  @IsOptional()
  campanhaId?: string;

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
  dataPrevista?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreatePecaDto {
  @IsUUID()
  @IsOptional()
  pautaId?: string;

  @IsUUID()
  @IsOptional()
  campanhaId?: string;

  @IsString()
  formato!: string;

  @IsString()
  titulo!: string;

  @IsString()
  @IsOptional()
  conteudo?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dataPublicacao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  plataformas?: string[];

  @IsString()
  @IsOptional()
  urlArquivo?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsString()
  @IsOptional()
  observacoesJuridicas?: string;
}

export class UpdatePecaDto {
  @IsUUID()
  @IsOptional()
  pautaId?: string;

  @IsUUID()
  @IsOptional()
  campanhaId?: string;

  @IsString()
  @IsOptional()
  formato?: string;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  conteudo?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dataPublicacao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  plataformas?: string[];

  @IsString()
  @IsOptional()
  urlArquivo?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsString()
  @IsOptional()
  observacoesJuridicas?: string;
}

export class CreateMencaoDto {
  @IsUUID()
  @IsOptional()
  campanhaId?: string;

  @IsString()
  canal!: string;

  @IsString()
  @IsOptional()
  autor?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  conteudo!: string;

  @IsString()
  @IsOptional()
  sentimento?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  alcanceEstimado?: number;

  @IsDateString()
  dataMencao!: string;
}

export class UpdateMencaoDto {
  @IsUUID()
  @IsOptional()
  campanhaId?: string;

  @IsString()
  @IsOptional()
  canal?: string;

  @IsString()
  @IsOptional()
  autor?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  conteudo?: string;

  @IsString()
  @IsOptional()
  sentimento?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  alcanceEstimado?: number;

  @IsDateString()
  @IsOptional()
  dataMencao?: string;
}
