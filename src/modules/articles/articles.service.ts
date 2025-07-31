import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { Article, ArticleResponseData, MultipleArticleResponse, SingleArticleResponse } from '../common/type/article-response.interface';
import { ListArticlesQueryDto } from './dto/list-articles.query.dto';
import { LIMIT_DEFAULT, OFFSET_DEFAULT } from '../common/constaints/constaints';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService
  ) { }

  async getBySlug(slug: string): Promise<SingleArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tagList: true,
        createdAt: true,
        updatedAt: true,
        favoritedBy: { select: { id: true } },
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    if (!article)
      throw new NotFoundException({
        message: this.i18n.translate('article.error.notFound'),
      });

    return { article: this.ArticleResponse(article) };
  }

  async create(createArticleDto: CreateArticleDto, currentUser: User): Promise<SingleArticleResponse> {
    const slug = createArticleDto.title.toLowerCase().replace(/\s+/g, '-');

    const existingArticle = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw new BadRequestException(
        this.i18n.translate('article.errors.titleExists')
      );
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
        favoritedBy: { select: { id: true } },
      },
    });

    return { article: this.ArticleResponse(artical, currentUser.id) };
  }

  async updateBySlug(slug: string, updateArticleDto: UpdateArticleDto, currentUser: User): Promise<SingleArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('article.errors.notFound')
      );
    }
    if (article.authorId !== currentUser.id) {
      throw new ForbiddenException(
        this.i18n.translate('article.errors.cannotUpdateArticle')
      );
    }
    let changeSlug: string = slug;

    if (updateArticleDto.title) {
      const newSlug = updateArticleDto.title.toLowerCase().replace(/\s+/g, '-');
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: newSlug },
      });

      if (existingArticle && existingArticle.slug !== slug) {
        throw new BadRequestException(
          this.i18n.translate('article.errors.titleExists')
        );
      }
      changeSlug = newSlug;
    }

    const updated = await this.prisma.article.update({
      where: { slug },
      data: {
        ...updateArticleDto,
        slug: changeSlug,
      },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        favoritedBy: { select: { id: true } },
      },
    });

    return { article: this.ArticleResponse(updated, currentUser.id) };
  }

  async deleteBySlug(slug: string, currentUser: User): Promise<SingleArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('article.errors.notFound')
      );
    }
    if (article.authorId !== currentUser.id) {
      throw new ForbiddenException(
        this.i18n.translate('article.errors.cannotDeleteArticle')
      );
    }

    const deleted = await this.prisma.article.delete({
      where: { slug },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        favoritedBy: { select: { id: true } },
      },
    });

    return { article: this.ArticleResponse(deleted, currentUser.id) };
  }

  async favorite(slug: string, currentUser: User): Promise<SingleArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('article.errors.notFound')
      );
    }

    const updated = await this.prisma.article.update({
      where: { slug },
      data: {
        favoritedBy: { connect: { id: currentUser.id } },
      },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        favoritedBy: { select: { id: true } },
      },
    });

    return {
      article: this.ArticleResponse(updated, currentUser.id),
    };
  }

  async unfavorite(slug: string, currentUser: User): Promise<SingleArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('article.errors.notFound')
      );
    }

    const updated = await this.prisma.article.update({
      where: { slug },
      data: {
        favoritedBy: { disconnect: { id: currentUser.id } },
      },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        favoritedBy: { select: { id: true } },
      },
    });
    return {
      article: this.ArticleResponse(updated, currentUser.id),
    };
  }

  async getListArticles(query: ListArticlesQueryDto, currentUser?: User): Promise<MultipleArticleResponse> {
    const { tag, author, favorited } = query;
    const limit = Number(query.limit) || LIMIT_DEFAULT;
    const offset = Number(query.offset) || OFFSET_DEFAULT;

    const where: any = {};

    if (tag) {
      where.tagList = {
        contains: tag,
      };
    }

    if (author) {
      where.author = {
        username: author,
      };
    }

    if (favorited) {
      where.favoritedBy = {
        some: { username: favorited },
      };
    }

    const articles = await this.prisma.article.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        author: { select: { username: true, bio: true, image: true } },
        favoritedBy: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const articleResponse = articles.map((article) => this.ArticleResponse(article, currentUser?.id));
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(await this.prisma.article.count() / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      articlesCount: articleResponse.length,
      articles: articleResponse,
      pagination: {
        currentPage,
        perPage: limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        previousPage: hasPreviousPage ? currentPage - 1 : null,
      }
    };
  }

  private ArticleResponse(
    article: Article,
    userId?: number,
  ): ArticleResponseData {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: JSON.parse(article.tagList),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: userId
        ? article.favoritedBy.some((user) => user.id === userId)
        : undefined,
      favoritesCount: article.favoritedBy.length,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
      },
    };
  }
}
