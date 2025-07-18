import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { User } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getArticle(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return article;
  }

  async createArticle(createArticleDto: CreateArticleDto, currentUser: User) {
    const slug = createArticleDto.title.toLowerCase().replace(/\s+/g, '-');

    const existingArticle = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw new Error('Article with this slug already exists');
    }

    const artical = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        description: createArticleDto.description,
        slug,
        body: createArticleDto.body,
        author: { connect: { id: currentUser.id } },
        tagList: JSON.stringify(createArticleDto.tagList ?? []),
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return {
      article: {
        ...artical,
        tagList: JSON.parse(artical.tagList),
      }
    }
  }

  async updateArticle(slug: string, updateArticleDto: UpdateArticleDto, currentUser: User) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error('Article not found');
    }
    if (article.authorId !== currentUser.id) {
      throw new Error('You are not allowed to update this article');
    }
    let changeSlug: string = slug;

    if (updateArticleDto.title) {
      const newSlug = updateArticleDto.title.toLowerCase().replace(/\s+/g, '-');
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: newSlug },
      });

      if (existingArticle && existingArticle.slug !== slug) {
        throw new Error('Article with this title already exists');
      }
      changeSlug = newSlug;
    }

    return this.prisma.article.update({
      where: { slug },
      data: {
        ...updateArticleDto,
        slug: changeSlug,
      },
    });
  }

  async deleteArticle(slug: string, currentUser: User) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.authorId !== currentUser.id) {
      throw new Error('You are not allowed to delete this article');
    }
    
    return this.prisma.article.delete({
      where: { slug },
    });
  }
}
