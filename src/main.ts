import { NestFactory, Reflector } from '@nestjs/core';
import * as passport from 'passport';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(passport.initialize());
  app.enableCors();
  app.use(graphqlUploadExpress({ maxFileSize: 100000000, maxFiles: 10 }));

  // Format class-validator errors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  // Format dto validator error messages
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const errorMessage = errors
          .flatMap((error) => Object.values(error.constraints))
          .join(', ');
        return new BadRequestException(errorMessage);
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // const PORT = process.env.NODE_PORT || 10005;
  const PORT = 3000;
  await app.listen(PORT);
}
bootstrap();
