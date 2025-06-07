import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { seed } from './seeds/seed';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/broglow';
  await seed(mongoUri);

  app.useGlobalPipes(new ValidationPipe());

  // Enhanced CORS configuration for mobile development
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://192.168.1.10:3000',
      'http://192.168.1.10:8081',
      /^http:\/\/192\.168\.\d+\.\d+:(3000|8081)$/,
      /^http:\/\/172\.\d+\.\d+\.\d+:(3000|8081)$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:(3000|8081)$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  app.setGlobalPrefix('api');

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('BroGlow Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'API-Key-auth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory());

  await app.listen(3001, '0.0.0.0'); // Listen on all network interfaces
}
bootstrap();
