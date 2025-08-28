import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserTokenPayload } from '../../models/auth.models';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'supersecretkey',
    });
  }

  async validate(payload: IUserTokenPayload) {
    // This will be attached to the request as req.user
    return {
      userId: payload.id,
      id: payload.id,
      email: payload.email,
      permission: payload.permission,
      firstName: payload.firstName,
      lastName: payload.lastName,
      companyRefId: payload.companyRefId,
      schoolRefId: payload.schoolRefId,
    };
  }
}