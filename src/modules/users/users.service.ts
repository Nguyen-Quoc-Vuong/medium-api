import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
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
}
