import { User } from '../entities';

export const sanitizeUser = (user: User) => {
  const { email, permission, password, ...rest } = user;
  return rest;
};
