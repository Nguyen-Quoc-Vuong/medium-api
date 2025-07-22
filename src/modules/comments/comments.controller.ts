import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '@prisma/client';

@Controller('api/articles')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':slug/comments')
  async create(@Param('slug') slug: string, @Body() createComment: CreateCommentDto, @CurrentUser() currentUser: User) {
    return this.commentsService.create(slug, createComment, currentUser);
  }

  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string) {
    return this.commentsService.getComments(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug/comments/:id')
  async deleteBySlug(@Param('slug') slug: string, @Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    return this.commentsService.deleteBySlug(slug, id, currentUser);
  }
}
