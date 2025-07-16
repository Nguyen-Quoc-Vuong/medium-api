import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { RegisterDto } from './dtos/register-user.dto';

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
}
