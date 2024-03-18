import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class ReportMentorInput {
  @Field()
  @IsNotEmpty({ message: "report 'content' is required" })
  @IsString({ message: "report 'content' must be a string value" })
  content: string;

  @Field()
  @IsNotEmpty({ message: "'mentorId' is required" })
  @IsUUID('all', { message: "invalid 'mentorId'" })
  mentorId: string;
}
