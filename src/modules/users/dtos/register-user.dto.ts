import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH } from 'src/modules/common/constaints/constaints';

export class RegisterDto {
  @IsNotEmpty({ message: 'auth.validation.emptyUsername' })
  username: string;

  @IsEmail({}, { message: 'auth.validation.invalidEmail' })
  @IsNotEmpty({ message: 'auth.validation.emailRequired' })
  email: string;

  @IsNotEmpty({ message: 'auth.validation.passwordRequired' })
  @MinLength(MIN_PASSWORD_LENGTH, { message: 'auth.validation.passwordTooShort' })
  password: string;
}
