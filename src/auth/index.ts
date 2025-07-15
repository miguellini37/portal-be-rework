import { Router } from 'express';
import { User } from '../entities/User';
import { compare } from 'bcrypt';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

export const authRoutes = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const generateAccessToken = (user: Partial<User>) => {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user: Partial<User>) => {
  return sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
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

    const { password: _password, ...payload } = user;
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 15,
      refreshTokenExpireIn: 1440,
      tokenType: 'Bearer',
      authState: payload,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

authRoutes.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.sendStatus(401);
  }

  verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (err: Error | null, user: string | JwtPayload | undefined) => {
      if (err || !user) {
        res.sendStatus(403);
      }

      const { password: _password, ...payload } = user as User;
      const accessToken = generateAccessToken(payload);
      res.json({ accessToken, expiresIn: 15 });
    }
  );
});
