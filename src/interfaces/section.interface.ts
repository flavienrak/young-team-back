import { FileInterface } from './file.interface';
import { UserInterface } from './user.interface';
import { ArticleInterface } from './article.interface';

export interface SectionInterface {
  id: number;
  content: string;

  userId: number;
  articleId: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
  article: ArticleInterface;
  files: FileInterface[];
}
