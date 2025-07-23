interface ArticleAuthor {
  username: string;
  bio: string | null;
  image: string | null;
  // followers: { id: number }[];
}

interface ArticleTag {
  name: string;
}

interface ArticleFavoritedBy {
  id: number;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string;
  createdAt: Date;
  updatedAt: Date;
  favoritedBy: ArticleFavoritedBy[];
  author: ArticleAuthor;
}

export interface ArticleResponseData {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited?: boolean;
  favoritesCount: number;
  author: {
    username: string;
    bio: string | null;
    image: string | null;
    // following?: boolean;
  };
}

export interface SingleArticleResponse {
  article: ArticleResponseData;
}

export interface MutlipleArticleResponse {
  articlesCount: number;
  articles: ArticleResponseData[];
}
