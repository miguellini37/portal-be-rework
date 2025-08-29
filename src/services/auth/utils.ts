import { User } from '../../entities';

export const sanitizeUser = (
  user: User,
  dropFields: (keyof User)[] = ['password', 'permission', 'email']
) => {
  for (const field of dropFields) {
    if (field in user) delete user[field];
  }
  return user;
};
