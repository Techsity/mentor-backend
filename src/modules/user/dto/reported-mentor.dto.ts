import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
class ReportUser extends User {
  @Field()
  id: string;
  @Field()
  name: string;
}

@ObjectType()
class ReportedMentor {
  @Field()
  id: string;
  @Field(() => ReportUser)
  user: ReportUser;
}

@ObjectType()
export class ReportedMentorDTO {
  @Field() id: string;
  @Field() content: string;
  // @Field(() => ReportUser) reported_by: ReportUser;
  // @Field(() => ReportedMentor) mentor: ReportedMentor;
  @Field() created_at: Date;
}
