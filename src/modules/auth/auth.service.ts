import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
      private jwtService: JwtService,
  ) {}

  async generateToken(user: any) {
  return this.jwtService.sign({
    id: user.id,
    email: user.email,
  });
  }

  async validateUser(user: any) {
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token: await this.generateToken(user),
      },
    };
  }

}
