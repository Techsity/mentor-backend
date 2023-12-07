import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
  @Field((type) => User)
  user: User;
}

@ObjectType()
class UserDetails {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  id: string;
}
@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;

  @Field((type) => UserDetails)
  user: UserDetails;

  @Field((type) => [String], { nullable: 'itemsAndList' })
  errors?: string[];
}

@ObjectType()
export class BasicMessageResponse {
  @Field()
  message: string;
}
