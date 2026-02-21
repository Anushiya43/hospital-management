import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  const corsMethods = (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE')
    .split(/[|,]/)
    .map((m) => m.trim())
    .filter(Boolean);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: corsMethods,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
