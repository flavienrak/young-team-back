import { ArticleInterface } from './article.interface';
import { SectionInterface } from './section.interface';
import { UserInterface } from './user.interface';

export interface FileInterface {
  id: number;
  src: string;

  userId: number;
  sectionId?: number;
  articleId?: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
  section?: SectionInterface;
  article?: ArticleInterface;
}
