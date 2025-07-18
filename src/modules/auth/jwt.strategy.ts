import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default',
    });
  }

  async validate(payload: { id: number; email: string }): Promise<User> {
    const user = await this.prisma.user.findUnique({
          where: { id: payload.id },
        })
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
