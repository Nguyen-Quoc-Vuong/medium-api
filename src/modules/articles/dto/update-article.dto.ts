import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: 'article.validation.titleMustBeString' })
  @IsNotEmpty({ message: 'article.validation.titleRequired' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'article.validation.descriptionMustBeString' })
  @IsNotEmpty({ message: 'article.validation.descriptionRequired' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'article.validation.bodyMustBeString' })
  @IsNotEmpty({ message: 'article.validation.bodyRequired' })
  body?: string;
}
