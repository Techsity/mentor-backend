import { NestFactory } from '@nestjs/core';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(passport.initialize());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
