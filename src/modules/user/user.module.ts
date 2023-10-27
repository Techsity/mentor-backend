import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MentorModule } from '../mentor/mentor.module';

@Module({
  imports: [forwardRef(() => MentorModule), TypeOrmModule.forFeature([User])],
  providers: [UserResolver, UserService],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
