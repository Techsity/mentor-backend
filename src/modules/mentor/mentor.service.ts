import { Injectable } from '@nestjs/common';
import { CreateMentorInput } from './dto/create-mentor.input';
import { UpdateMentorInput } from './dto/update-mentor.input';

@Injectable()
export class MentorService {
  createMentorProfile(createMentorInput: CreateMentorInput) {
    return 'This action adds a new mentor';
  }
}
