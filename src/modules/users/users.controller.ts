import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { RegisterDto } from './dtos/register-user.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from '.prisma/client/default';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('users')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.register(registerDto);
    return this.authService.validateUser(user);
  }

  @Post('users/login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.signin(loginDto);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@CurrentUser() user: User) {
    return this.authService.validateUser(user);
  }

  @Get('profile/:username')
  async getProfile(@Param('username') username: string, @CurrentUser() currentUser: User) {
    return this.usersService.getProfile(username, currentUser);
  }

  @Put('user')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Body() updateDto: UpdateUserDto, @CurrentUser() currentUser: User) {
   return this.usersService.updateUser(currentUser, updateDto);
  }
}
