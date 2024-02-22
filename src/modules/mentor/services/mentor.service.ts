import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CreateMentorInput } from '../dto/create-mentor.input';
import { MentorDTO } from '../dto/mentor.dto';
import { UpdateMentorInput } from '../dto/update-mentor.input';
import { Mentor } from '../entities/mentor.entity';

@Injectable({ scope: Scope.REQUEST })
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async createMentorProfile(
    createMentorInput: CreateMentorInput,
  ): Promise<CreateMentorInput> {
    try {
      const user = await this.findLoggedInUser();
      const mentorProfile = await this.mentorRepository.save({
        ...createMentorInput,
        user,
      });
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async updateMentorProfile(
    updateMentorInput: UpdateMentorInput,
  ): Promise<UpdateMentorInput> {
    try {
      const user = await this.findLoggedInUser();
      await this.mentorRepository.update(
        { user: { id: user.id } },
        updateMentorInput,
      );
      const mentorProfile = await this.getMentorProfile();
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async findLoggedInUser() {
    const authUser = this.request.req.user;
    const user = await this.userRepository.findOne({
      where: { id: authUser.user.id },
    });
    return user;
  }
  
  async getMentorProfile(): Promise<any> {
    try {
      const user = this.request.req.user.user;
      const mentorProfile = await this.mentorRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user', 'courses', 'reviews'],
      });
      if (!mentorProfile)
        throw new NotFoundException(`No Mentor Profile found!`);
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async viewMentor(id: string): Promise<any> {
    try {
      const mentorProfile = await this.mentorRepository.findOne({
        where: { id },
        relations: ['user', 'courses', 'reviews'],
      });
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async viewAllMentors(): Promise<any[]> {
    try {
      const mentorProfile = await this.mentorRepository.find({
        relations: ['user'],
      });
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }
}
