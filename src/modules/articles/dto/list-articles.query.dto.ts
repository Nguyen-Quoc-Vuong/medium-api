import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListArticlesQueryDto {
  @IsOptional()
  @IsString({message: 'articles.validation.tagMustBeString'})
  tag?: string;

  @IsOptional()
  @IsString({message: 'articles.validation.authorMustBeString'})
  author?: string;

  @IsOptional()
  @IsString({message: 'articles.validation.favoritedMustBeString'})
  favorited?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0)
  offset?: number;
}
