import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'auth.validation.invalidEmail'})
  email: string;

  @IsNotEmpty({ message: 'auth.validation.passwordRequired' })
  password: string;
}
