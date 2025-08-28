import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign, verify, JwtPayload as JWT } from 'jsonwebtoken';
import { User, Athlete, CompanyEmployee } from '../../entities';
import { ILoginInput, IRefreshTokenInput, IRegisterInput, IAuthResponse, IUserTokenPayload } from '../../models/auth.models';
import { createAthlete } from '../athletes/athletes.service';
import { createSchoolEmployee } from '../schools/school-employees.service';
import { createCompanyEmployee } from '../companies/company-employees.service';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private getPayloadFromUser(user: User): IUserTokenPayload {
    return {
      id: user.id!,
      email: user.email!,
      permission: user.permission!,
      firstName: user.firstName!,
      lastName: user.lastName!,
      companyRefId: (user as CompanyEmployee).companyRef?.id,
      schoolRefId: (user as Athlete).schoolRef?.id,
    };
  }

  private generateAccessToken(payload: IUserTokenPayload) {
    return sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }

  private generateRefreshToken(payload: IUserTokenPayload) {
    return sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
  }

  async login(loginDto: ILoginInput): Promise<IAuthResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['companyRef', 'schoolRef'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('Invalid credentials.');
    }

    const isAuthenticated = await compare(password, user.password);
    if (!isAuthenticated) {
      throw new BadRequestException('Invalid credentials.');
    }

    const payload = this.getPayloadFromUser(user);
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15,
      refreshTokenExpireIn: 1440,
      tokenType: 'Bearer',
      authState: payload,
    };
  }

  async refreshToken(refreshTokenDto: IRefreshTokenInput): Promise<IAuthResponse> {
    const { refreshToken } = refreshTokenDto;
    
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = verify(refreshToken, this.REFRESH_TOKEN_SECRET) as JWT;
      
      // Remove exp, iat, nbf if present
      const { exp, iat, nbf, ...cleanPayload } = payload as any;

      // Generate new tokens
      const accessToken = this.generateAccessToken(cleanPayload as IUserTokenPayload);
      const newRefreshToken = this.generateRefreshToken(cleanPayload as IUserTokenPayload);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15,
        refreshTokenExpireIn: 1440,
        tokenType: 'Bearer',
        authState: cleanPayload as IUserTokenPayload,
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async register(registerDto: IRegisterInput): Promise<{ message: string }> {
    const userInput = registerDto;

    if (!userInput.email || !userInput.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const existing = await this.userRepository.findOne({ where: { email: userInput.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists.');
    }

    let user;
    switch (userInput.permission) {
      case 'athlete':
        user = await createAthlete(userInput as any);
        break;
      case 'school':
        user = await createSchoolEmployee(userInput as any);
        break;
      case 'company':
        user = await createCompanyEmployee(userInput as any);
        break;
      default:
        throw new BadRequestException('User type not defined');
    }

    return { message: 'Account created successfully' };
  }
}