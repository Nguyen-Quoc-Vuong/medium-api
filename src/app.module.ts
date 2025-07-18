import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
