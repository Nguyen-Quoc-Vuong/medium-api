import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from '../auth/auth.service';
import { access } from 'fs';

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

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
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
}
