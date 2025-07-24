import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty({ message: 'comment.validation.bodyRequired' })
  body: string;
}
