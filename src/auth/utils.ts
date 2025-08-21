<<<<<<< HEAD
import { User } from '../entities';

export const sanitizeUser = (user: User) => {
  const { email, permission, password, ...rest } = user;
  return rest;
};
=======
import { User } from '../entities/User';

export type SafeUser<T extends User = User> = Omit<T, 'password' | 'permission'>;

export function stripUser<T extends User>(
  user: T | null | undefined,
  extraFields: (keyof User)[] = []
): SafeUser<T> | null | undefined {
  if (!user) return user as any;
  const { password, permission, ...rest } = (user as unknown) as Record<string, any>;
  for (const f of extraFields) delete (rest as any)[f as string];
  return rest as SafeUser<T>;
}

export function stripUsers<T extends User>(
  users: ReadonlyArray<T> | null | undefined,
  extraFields: (keyof User)[] = []
): SafeUser<T>[] {
  return (users ?? []).map(({ password, permission, ...rest }: any) => {
    for (const f of extraFields) delete rest[f as string];
    return rest as SafeUser<T>;
  });
}
>>>>>>> 3231526 (utils combo fix)
