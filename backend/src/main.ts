import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4000;
  
  await app.listen(port);
  console.log(`🚀 BarFlow Backend is running on: http://localhost:${port}/api`);
}

bootstrap();