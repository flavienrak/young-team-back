import { FileInterface } from './file.interface';
import { UserInterface } from './user.interface';
import { PartageInterface } from './partage.interface';

export interface SectionInterface {
  id: number;
  content: string;

  userId: number;
  partageId: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
  partage: PartageInterface;
  files: FileInterface[];
}
