import { TransactionStatus, TransactionType } from '../enum';
import { User } from 'src/modules/user/entities/user.entity';
import Wallet from 'src/modules/wallet/entities/wallet.entity';
import { ObjectType, Field, Float, Scalar } from '@nestjs/graphql';
import { UserDTO } from 'src/modules/user/dto/user.dto';

@ObjectType()
export class TransactionDTO {
  @Field()
  id: string;

  @Field(() => UserDTO)
  sender: User;

  @Field(() => UserDTO, { nullable: true })
  receiver: User;

  @Field()
  sender_id: string;

  @Field({ nullable: true })
  receiver_id: string;

  @Field(() => TransactionType)
  type: TransactionType;

  @Field(() => Float)
  amount: number;

  @Field()
  reference: string;

  @Field(() => JSONObjectScalar, { nullable: true })
  metadata?: object;

  @Field(() => TransactionStatus)
  status: TransactionStatus;

  @Field()
  createdAt: Date;
}

@Scalar('JSONObject', () => Object)
export class JSONObjectScalar {
  description = 'JSON object scalar type';
}
