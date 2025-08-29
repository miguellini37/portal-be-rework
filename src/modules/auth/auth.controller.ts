import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ILoginInput,
  IRefreshTokenInput,
  IRegisterInput,
  IAuthResponse,
} from '../../models/auth.models';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: ILoginInput): Promise<IAuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: IRefreshTokenInput): Promise<IAuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: IRegisterInput): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }
}
