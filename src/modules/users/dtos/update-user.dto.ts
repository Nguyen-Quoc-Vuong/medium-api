import { IsOptional, IsString, MinLength, IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'user.validation.invalidEmail' })
  email?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'user.validation.usernameRequired' })
  @IsString({ message: 'user.validation.usernameMustBeString' })
  username?: string;

  @IsOptional()
  @MinLength(6, { message: 'auth.validation.passwordTooShort' })
  password?: string;

  @IsOptional()
  confirmPassword?: string;

  @IsOptional()
  @IsString({ message: 'user.validation.bioMustBeString' })
  bio?: string;

  @IsOptional()
  image?: string;
}
