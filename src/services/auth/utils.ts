import { User } from '../../entities';
import { Application } from '../../entities';

export const sanitizeUser = (
  user: User,
  dropFields: (keyof User)[] = ['password', 'permission']
) => {
  if (!user) {
    return user;
  }
  for (const field of dropFields) {
    if (field in user) {
      delete user[field];
    }
  }
  return user;
};

export const sanitizeApplication = (
  application: Application,
  dropFields: (keyof Application)[] = ['job']
) => {
  const copy = { ...application } as Application;
  for (const field of dropFields) {
    if (field in copy) {
      delete copy[field];
    }
  }
  return copy;
};
