import { faker } from '@faker-js/faker';
import { User } from '../modules/user-modules/user/entities/user.entity';
export function createUser(): User {
  const user = new User();
  user.name = faker.internet.displayName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.phone = faker.phone.toString();
  user.country = faker.location.country();
  user.avatar = faker.image.avatar();
  user.is_verified = true;
  user.is_active = true;
  return user;
}
