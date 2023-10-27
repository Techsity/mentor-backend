import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Mentor } from './entities/mentor.entity';
import { MentorService } from './mentor.service';
import { MentorResolver } from './mentor.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([Mentor])],
  providers: [MentorResolver, MentorService],
  exports: [TypeOrmModule.forFeature([Mentor])],
})
export class MentorModule {}
