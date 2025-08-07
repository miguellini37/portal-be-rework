import { Router } from 'express';
import { User } from '../entities/User';
import { compare } from 'bcrypt';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { Athlete, CompanyEmployee } from '../entities';

export const authRoutes = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const getPayloadFromUser = (
  user: User
): Partial<User> & {
  companyRefId?: string;
  schoolRefId?: string;
} => {
  return {
    id: user.id,
    email: user.email,
    permission: user.permission,
    firstName: user.firstName,
    lastName: user.lastName,
    companyRefId: (user as CompanyEmployee).companyRef?.id,
    schoolRefId: (user as Athlete).schoolRef?.id,
  };
};

const generateAccessToken = (user: Partial<User>) => {
  // Only include minimal fields in the JWT payload
  const payload = getPayloadFromUser(user as User);
  return sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user: Partial<User>) => {
  // Only include minimal fields in the JWT payload
  const payload = getPayloadFromUser(user as User);
  return sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
};

authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({
      where: { email },
      relations: ['companyRef', 'schoolRef'],
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isAuthenticated = await compare(password, user.password);
    if (!isAuthenticated) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 15,
      refreshTokenExpireIn: 1440,
      tokenType: 'Bearer',
      authState: getPayloadFromUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

authRoutes.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.sendStatus(401);
  }

  verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (err: Error | null, user: string | JwtPayload | undefined) => {
      if (err || !user) {
        return res.sendStatus(403);
      }

      // Generate new tokens
      const accessToken = generateAccessToken(user as User);
      const newRefreshToken = generateRefreshToken(user as User);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15, // access token expiration (minutes)
        refreshTokenExpireIn: 1440, // refresh token expiration (minutes)
      });
    }
  );
});
