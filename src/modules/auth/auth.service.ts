import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '@prisma/client';
import { UserResponseData } from '../common/type/user-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async generateToken(user: User) {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
  }

  async validateUser(user: User): Promise<UserResponseData> {
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
