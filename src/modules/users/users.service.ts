import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dtos/register-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService
  ) { }

  async register(registerDto: RegisterDto) {
    const emailExits = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (emailExits) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.emailExists')
      );
    }

    const usernameExists = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (usernameExists) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.usernameExists')
      );
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
      throw new UnauthorizedException(
        this.i18n.translate('user.errors.invalidCredentials')
      );
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
        followedBy: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('user.errors.notFound')
      );
    }
    const isFollowing = currentUser
      ? user.followedBy.some(follower => follower.id === currentUser.id)
      : false;

    return this.getProfileResponseFollow(user, currentUser);
  }

  async updateUser(currentUser: User, updateDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('user.errors.notFound')
      );
    }

    const updateData: any = {};

    if (updateDto.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });

      if (emailExists && emailExists.id !== currentUser.id) {
        throw new BadRequestException(
          this.i18n.translate('user.errors.emailExists')
        );
      }

      updateData.email = updateDto.email;
    }

    if (updateDto.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateDto.username },
      });

      if (usernameExists) {
        throw new BadRequestException(
          this.i18n.translate('user.errors.usernameExists')
        );
      }

      updateData.username = updateDto.username;
    }

    if (updateDto.password) {
      if (updateDto.password !== updateDto.confirmPassword) {
        throw new BadRequestException(
          this.i18n.translate('user.errors.passwordMismatch')
        );
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

  async followUser(currentUser: User, username: string) {
    const userToFollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      throw new NotFoundException(
        this.i18n.translate('user.errors.notFound')
      );
    }

    if (currentUser.username === username) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.cannotFollowSelf')
      );
    }

    const alreadyFollowing = await this.prisma.user.findFirst({
      where: {
        id: currentUser.id,
        following: {
          some: { id: userToFollow.id },
        },
      },
    });

    if (alreadyFollowing) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.alreadyFollowing')
      );
    }

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          connect: { id: userToFollow.id },
        },
      },
    });

    return this.getProfileResponseFollow(userToFollow, currentUser);
  }

  async unfollowUser(currentUser: User, username: string) {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      throw new NotFoundException(
        this.i18n.translate('user.errors.notFound')
      );
    }

    if (currentUser.username === userToUnfollow.username) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.cannotUnfollowSelf')
      );
    }

    const notFollowing = await this.prisma.user.findFirst({
      where: {
        id: currentUser.id,
        following: {
          none: { id: userToUnfollow.id },
        },
      },
    });

    if (notFollowing) {
      throw new BadRequestException(
        this.i18n.translate('user.errors.notFollowing')
      );
    }

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          disconnect: { id: userToUnfollow.id },
        },
      },
    });

    return this.getProfileResponseFollow(userToUnfollow, currentUser);
  }

  private async getProfileResponseFollow(user: any, currentUser?: User) {
    let isFollowing = false;

    if (currentUser) {
      const followingRelation = await this.prisma.user.findFirst({
        where: {
          id: currentUser.id,
          following: {
            some: { id: user.id },
          },
        },
      });
      isFollowing = !!followingRelation;
    }

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: isFollowing,
      },
    };
  }
}
