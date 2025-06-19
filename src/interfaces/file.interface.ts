import { PartageInterface } from './partage.interface';
import { SectionInterface } from './section.interface';
import { UserInterface } from './user.interface';

export interface FileInterface {
  id: number;
  src: string;

  userId: number;
  sectionId?: number;
  partageId?: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
  section?: SectionInterface;
  partage?: PartageInterface;
}
