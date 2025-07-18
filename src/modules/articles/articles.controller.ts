import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService
  ) { }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string) {
    return this.articlesService.getArticle(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createArticle(@Body() createArticleDto: CreateArticleDto, @CurrentUser() currentUser: User) {
    return this.articlesService.createArticle(createArticleDto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':slug')
  async updateArticle(@Param('slug') slug: string, @Body() updateArticleDto: UpdateArticleDto, @CurrentUser() currentUser: User) {
    return this.articlesService.updateArticle(slug, updateArticleDto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug')
  async deleteArticle(@Param('slug') slug: string, @CurrentUser() currentUser: User) {
    return this.articlesService.deleteArticle(slug, currentUser);
  }

}
