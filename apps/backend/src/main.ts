import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // chuẩn bị cho Logger
  });

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip non-decorated fields
      forbidNonWhitelisted: true, // reject if extra fields exist
      transform: true, // auto-convert types (e.g., string to number)
    }),
  );

  // ✅ Enable CORS (optional)
  app.enableCors();

  // ✅ Start app
  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on http://localhost:${port}`);

  mongoose.connect(process.env.MONGODB_URI!).then(() => {
  const { host, port, name: dbName, user } = mongoose.connection;
  console.log(`✅ Connected to MongoDB as "${user}" at ${host}:${port}, database "${dbName}"`);
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

}
bootstrap();
