import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Athlete, CompanyEmployee, Company, School } from '../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([User, Athlete, CompanyEmployee, Company, School]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}