import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(slug: string, createComment: CreateCommentDto, currentUser: User) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
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

  async getComments(slug: string, currentUser: User) {
    const article = await this.prisma.article.findUnique({
      where: { slug }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
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

  async deleteBySlug(slug: string, id: number, currentUser: User) {
    const article = await this.prisma.article.findUnique({
      where: { slug }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    await this.prisma.comment.delete({
      where: { id }
    });

    return { message: 'Comment deleted successfully', slug };
  }
}
