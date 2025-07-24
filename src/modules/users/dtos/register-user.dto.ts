import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'auth.validation.emptyUsername' })
  username: string;

  @IsEmail({}, { message: 'auth.validation.invalidEmail' })
  @IsNotEmpty({ message: 'auth.validation.emailRequired' })
  email: string;

  @IsNotEmpty({ message: 'auth.validation.passwordRequired' })
  @MinLength(6, { message: 'auth.validation.passwordTooShort' })
  password: string;
}
