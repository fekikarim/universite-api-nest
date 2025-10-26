import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';

// Importer cookie-parser
import cookieParser from 'cookie-parser';

// Swagger for API documentation
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Helmet for security headers
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Security headers
  app.use(helmet());

  // Ajouter cookie-parser
  app.use(cookieParser());

  // CORS (si front sur un domaine différent)
  const ORIGIN = process.env.CORS_ORIGIN?.split(',').map(s => s.trim());
  app.enableCors({
    origin: ORIGIN || true, // en prod: mettre la liste des origines autorisées
    credentials: true,      // Autoriser l'envoi des cookies
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Université API')
    .setDescription('API de gestion universitaire avec authentification JWT et refresh tokens')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // Nom de reference
    )
    .addTag('Auth', 'Authentification et gestion des sessions')
    .addTag('Utilisateurs', 'Gestion des utilisateurs (CRUD)')
    .addTag('Options', 'Gestion des options académiques')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);

  // Log the URLs
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
