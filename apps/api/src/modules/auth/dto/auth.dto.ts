import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'O e-mail deve ser válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'O nome completo é muito curto' })
  fullName!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'O e-mail deve ser válido' })
  email!: string;

  @IsString()
  password!: string;
}
