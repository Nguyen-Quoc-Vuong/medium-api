import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const emailExits = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (emailExits) {
      throw new Error('Email already exists');
    }

    const usernameExists = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (usernameExists) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async signin(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.authService.generateToken(user);
    const { password, ...safe } = user;

    return {
      user: safe,
      access_token: token,
    };
  }

  async getProfile(username: string, currentUser?: User) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        email: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      profile: {
        ...user,
      }
    };
  }

  async updateUser(currentUser: User, updateDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {};

    if (updateDto.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }

      updateData.email = updateDto.email;
    }

    if (updateDto.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateDto.username },
      });

      if (usernameExists) {
        throw new Error('Username already exists');
      }

      updateData.username = updateDto.username;
    }

    if (updateDto.password) {
      if (updateDto.password !== updateDto.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (updateDto.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      updateData.password = await bcrypt.hash(updateDto.password, 10);
    }

    if (updateDto.bio) {
      updateData.bio = updateDto.bio;
    }

    if (updateDto.image) {
      updateData.image = updateDto.image;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    const { password, ...safe } = updatedUser;
    return safe;
  }
}
