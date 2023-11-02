// types.d.ts
declare namespace Express {
  import { User } from '../user/entities/user.entity';
  export interface Request {
    user?: User; // Define the user property type. Use a more specific type if you have one for your user object.
  }
}
