// import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RoleEnum } from 'src/modules/user/types/user.type';

// @Injectable()
// export class RoleGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}
//   canActivate(context: ExecutionContext): boolean {
//     const userRoles = this.reflector.getAllAndOverride<RoleEnum[]>('role', [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!userRoles) {
//       return true;
//     }
//     const req = context.switchToHttp().getRequest();
//     const user = req.user;
//     console.log({ accountTypeUser: user });
//     return userRoles.some((role) => user.role.includes(role));
//   }
// }

// import { SetMetadata } from '@nestjs/common';
// import { RoleEnum } from 'src/modules/user/types/user.type';

// export const ROLE_KEY = 'role';
// export const RoleDecorator = (...role: RoleEnum[]) =>
//   SetMetadata(ROLE_KEY, role);
