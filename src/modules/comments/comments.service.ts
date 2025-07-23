import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { MultipleCommentResponse, SingleCommentResponse } from '../common/type/comment-response.interface';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService
  ) {}

  async create(slug: string, createComment: CreateCommentDto, currentUser: User): Promise<SingleCommentResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.translate('article.errors.articleNotFound'));
    }

    const createdComment = await this.prisma.comment.create({
      data: {
        body: createComment.body,
        article: { connect: { id: article.id } },
        author: { connect: { id: currentUser.id } },
      },
      include: {
        author: { select: { username: true, bio: true, image: true } }
      }
    });

    return {
      comment: {
        id: createdComment.id,
        createdAt: createdComment.createdAt,
        body: createdComment.body,
        author: {
          ...createdComment.author,
        }
      }
    };
  }

  async getComments(slug: string): Promise<MultipleCommentResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug }
    });

    if (!article) {
      throw new NotFoundException(this.i18n.translate('article.errors.articleNotFound'));
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: { select: { username: true, bio: true, image: true } }
      }
    });

    return {
      comments: comments.map(comment => ({
        id: comment.id,
        createdAt: comment.createdAt,
        body: comment.body,
        author: {
          ...comment.author,
        }
      }))
    };
  }

  async deleteBySlug(slug: string, id: number, currentUser: User): Promise<{ message: string; slug: string }> {
    const article = await this.prisma.article.findUnique({
      where: { slug }
    });

    if (!article) {
      throw new NotFoundException(this.i18n.translate('comment.errors.articleNotFound'));
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      throw new NotFoundException(this.i18n.translate('comment.errors.commentNotFound'));
    }

    if (comment.articleId !== article.id) {
      throw new BadRequestException(this.i18n.translate('comment.errors.commentWrongArticle', {
          args: { slug }
        }));
    }

    if (comment.authorId !== currentUser.id &&  article.authorId !== currentUser.id) {
      throw new ForbiddenException(this.i18n.translate('comment.errors.cannotDeleteComment'));
    }

    await this.prisma.comment.delete({
      where: { id }
    });

    return { message: this.i18n.translate('comment.success.deleted'), slug };
  }
}
