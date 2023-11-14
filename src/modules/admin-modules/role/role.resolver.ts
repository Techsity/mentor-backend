import { Resolver } from '@nestjs/graphql';
import { RoleService } from './role.service';

@Resolver()
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}
}
