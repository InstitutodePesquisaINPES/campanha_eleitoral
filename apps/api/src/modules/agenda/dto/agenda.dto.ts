import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateAgendaDto {
  @IsString()
  titulo!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  tipo!: string;

  @IsDateString()
  dataInicio!: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsBoolean()
  @IsOptional()
  diaInteiro?: boolean;

  @IsString()
  @IsOptional()
  local?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  bairroId?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  planoAcaoId?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;
}

export class UpdateAgendaDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsBoolean()
  @IsOptional()
  diaInteiro?: boolean;

  @IsString()
  @IsOptional()
  local?: string;

  @IsUUID()
  @IsOptional()
  municipioId?: string;

  @IsUUID()
  @IsOptional()
  bairroId?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  planoAcaoId?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;
}

export class CreateParticipanteDto {
  @IsUUID()
  pessoaId!: string;

  @IsString()
  @IsOptional()
  papel?: string;

  @IsBoolean()
  @IsOptional()
  confirmado?: boolean;

  @IsBoolean()
  @IsOptional()
  compareceu?: boolean;
}

export class UpdateParticipanteDto {
  @IsString()
  @IsOptional()
  papel?: string;

  @IsBoolean()
  @IsOptional()
  confirmado?: boolean;

  @IsBoolean()
  @IsOptional()
  compareceu?: boolean;
}

export class CreateCheckinDto {
  @IsString()
  tipo!: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateFollowupDto {
  @IsString()
  descricao!: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsDateString()
  @IsOptional()
  prazo?: string;

  @IsBoolean()
  @IsOptional()
  concluido?: boolean;
}

export class UpdateFollowupDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsUUID()
  @IsOptional()
  responsavelId?: string;

  @IsDateString()
  @IsOptional()
  prazo?: string;

  @IsBoolean()
  @IsOptional()
  concluido?: boolean;
}
