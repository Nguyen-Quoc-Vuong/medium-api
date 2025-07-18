import { IsOptional, IsString, MinLength, IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  username?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  image?: string;
}
