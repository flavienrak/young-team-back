import { FileInterface } from './file.interface';
import { PartageInterface } from './partage.interface';
import { SectionInterface } from './section.interface';
import { UserInfoInterface } from './userInfos.interface';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  secteur?: string;
  type: string;

  createdAt: Date;
  updatedAt: Date;

  partages: PartageInterface[];
  files: FileInterface[];
  sections: SectionInterface[];
  userInfos?: UserInfoInterface;
}
