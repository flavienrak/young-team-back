import { UserInterface } from './user.interface';

export interface UserInfoInterface {
  id: number;
  isVerified: boolean;
  acceptCondition: boolean;

  userId: number;

  createdAt: Date;
  updatedAt: Date;

  user: UserInterface;
}
