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
  async getBySlug(@Param('slug') slug: string) {
    return this.articlesService.getBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() currentUser: User) {
    return this.articlesService.create(createArticleDto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':slug')
  async updateBySlug(@Param('slug') slug: string, @Body() updateArticleDto: UpdateArticleDto, @CurrentUser() currentUser: User) {
    return this.articlesService.updateBySlug(slug, updateArticleDto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug')
  async deleteBySlug(@Param('slug') slug: string, @CurrentUser() currentUser: User) {
    return this.articlesService.deleteBySlug(slug, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':slug/favorite')
  async favorite(@Param('slug') slug: string, @CurrentUser() currentUser: User) {
    return this.articlesService.favorite(slug, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug/favorite')
  async unfavorite(@Param('slug') slug: string, @CurrentUser() currentUser: User) {
    return this.articlesService.unfavorite(slug, currentUser);
  }
}
