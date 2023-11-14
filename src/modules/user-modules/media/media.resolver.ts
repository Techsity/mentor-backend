import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { MediaService } from './media.service';
// @ts-ignore
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@Resolver()
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}
  // @Mutation(() => Boolean)
  // async uploadImage(
  //   @Args({ name: 'file', type: () => GraphQLUpload }) file: any,
  // ): Promise<any> {
  //   return this.mediaService.uploadImage(file);
  // }
  //
  // @Mutation(() => Boolean)
  // async uploadVideo(
  //   @Args({ name: 'file', type: () => GraphQLUpload }) file: any,
  // ): Promise<any> {
  //   return this.mediaService.uploadVideo(file);
  // }

  // @Mutation(() => Boolean)
  // async uploadVideosConcurrently(
  //   @Args({ name: 'files', type: () => [GraphQLUpload] }) files: any[],
  // ): Promise<boolean> {
  //   return this.mediaService.uploadVideosConcurrently(files);
  // }
}
