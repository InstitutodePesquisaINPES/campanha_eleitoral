import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true, // TODO: restringir para domínios de produção
    credentials: true,
  });

  // Prefixo de API
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 3001);

  await app.listen(port);
  console.log(`[SIGT API] Rodando na porta ${port}`);
}
bootstrap();
