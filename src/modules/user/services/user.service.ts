import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository, MoreThanOrEqual, Equal } from 'typeorm';
import { AuthService } from '../../auth/services/auth.service';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { UserDTO } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { isUUID } from 'class-validator';
import { ReportMentorInput } from '../dto/report-mentor.input';
import { ReportedMentorDTO } from '../dto/reported-mentor.dto';
import { ReportedMentor } from '../entities/reported-mentor.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(ReportedMentor)
    private reportRepository: Repository<ReportedMentor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    private authService: AuthService,
  ) {}
  async userProfile(): Promise<UserDTO> {
    try {
      const authUser = this.request.req.user;
      const userProfile = await this.userRepository.findOne({
        where: { id: authUser.id },
        relations: ['mentor', 'subscriptions', 'notifications'],
      });
      // Update the video_url for each course and section
      // userProfile.courses.forEach((course) => {
      //   course.course_contents.forEach((content) => {
      //     content.course_sections.forEach((section) => {
      //       if (section.video_url) {
      //         section.video_url = `${baseURL}/${section.video_url}`;
      //       }
      //     });
      //   });
      // });
      return { ...userProfile, is_mentor: userProfile.mentor ? true : false };
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userUpdateInput: any): Promise<any> {
    try {
      const authUser = this.request.req.user;
      await this.userRepository.update({ id: authUser.id }, userUpdateInput);
      const user = await this.userProfile();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async toggleFollowMentor(
    mentorId: string,
    follow: boolean,
  ): Promise<boolean> {
    const authUser = this.request.req.user;
    if (!isUUID(mentorId)) throw new BadRequestException('Invalid mentorId');
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ['followers'],
    });
    if (!mentor)
      throw new NotFoundException(`Mentor with ID ${mentorId} not found`);

    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new NotFoundException(`User with ID not found`);

    const isFollowing = mentor.followers.some(
      (follower) => follower.id === user.id,
    );

    if (follow && !isFollowing) {
      mentor.followers.push(user);
    } else if (!follow && isFollowing) {
      mentor.followers = mentor.followers.filter(
        (follower) => follower.id !== user.id,
      );
    } else {
      return true; // No action needed (user is already following/unfollowing)
    }

    await this.mentorRepository.save(mentor);
    return true;
  }

  async reportMentor(input: ReportMentorInput) {
    const authUser = this.request.req.user;

    const { content, mentorId } = input;
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { id: mentorId },
        relations: ['user'],
      });
      if (!mentor)
        throw new NotFoundException("Mentor with this Id doesn't exist");

      // const now = new Date();
      // const reportHistory = await this.reportRepository.find({
      //   where: [
      //     { reported_by: { id: authUser.id } },
      //     { mentor: { id: mentorId } },
      //     // { created_at: Equal(now) },
      //   ],
      //   order: { created_at: 'desc' },
      // });

      const report = await this.reportRepository.save({
        content,
        reported_by: authUser,
        mentor,
      });
      return report;
    } catch (error) {
      console.log({ error });
      const stackTrace = new Error().stack;
      throw new InternalServerErrorException({
        message: 'Something went wrong',
        error,
        stackTrace,
      });
    }
  }
}
