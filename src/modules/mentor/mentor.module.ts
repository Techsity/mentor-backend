import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { MentorService } from './mentor.service';
import { MentorResolver } from './mentor.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  providers: [MentorResolver, MentorService],
})
export class MentorModule {}
