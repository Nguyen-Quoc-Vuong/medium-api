interface Author {
  username: string;

  bio: string | null;

  image: string | null;

  // following?: boolean;
}

export interface CommentResponseData {
  id: number;

  createdAt: Date;

  body: string;

  author: Author;
}

export interface SingleCommentResponse {
  comment: CommentResponseData;
}

export interface MultipleCommentResponse {
  comments: CommentResponseData[];
}
