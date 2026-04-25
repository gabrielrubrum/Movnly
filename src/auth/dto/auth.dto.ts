import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsString, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Formato de e-mail inválido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @MaxLength(254)
    email: string;

    @IsString()
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
    @MaxLength(128)
    @IsOptional()
    password?: string;

    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(10) // honeypot deve estar vazio
    honeypot?: string;

    @IsString()
    @IsOptional()
    provider?: string;

    @IsString()
    @IsOptional()
    providerId?: string;
}

export class RegisterDriverDto extends RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'A licença de condução é obrigatória' })
    @MaxLength(50)
    license: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Formato de e-mail inválido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @MaxLength(254)
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória' })
    @MaxLength(128)
    password: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    honeypot?: string;

    @IsString()
    @IsOptional()
    @MaxLength(6)
    twoFactorCode?: string;
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Formato de e-mail inválido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @MaxLength(254)
    email: string;
}

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Formato de e-mail inválido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @MaxLength(254)
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'O código é obrigatório' })
    @MaxLength(6)
    code: string;

    @IsString()
    @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
    @MaxLength(128)
    password: string;
}
