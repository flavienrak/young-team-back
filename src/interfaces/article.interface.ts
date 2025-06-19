import { FileInterface } from './file.interface';
import { UserInterface } from './user.interface';
import { SectionInterface } from './section.interface';

export interface ArticleInterface {
  id: number;
  title: string;
  description: string;
  secteur: string;

  userId: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
  sections: SectionInterface[];
  files: FileInterface[];
}
