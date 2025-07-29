import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateArticleDto {
  @IsString({ message: 'article.validation.titleMustBeString' })
  @IsNotEmpty({ message: 'article.validation.titleRequired' })
  title: string;

  @IsString({ message: 'article.validation.descriptionMustBeString' })
  @IsNotEmpty({ message: 'article.validation.descriptionRequired' })
  description: string;

  @IsString({ message: 'article.validation.bodyMustBeString' })
  @IsNotEmpty({ message: 'article.validation.bodyRequired' })
  body: string;

  @IsOptional()
  @IsArray({ message: 'article.validation.tagListMustBeArray' })
  @IsString({ each: true, message: 'article.validation.tagMustBeString' })
  tagList?: string[];
}
