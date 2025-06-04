import { Module } from '@nestjs/common';
import { AppConfig} from './config/index';
import { TwinModule } from './modules/twin/twin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
     MongooseModule.forRoot(process.env.MONGODB_URI!, {
      ssl: true, // cần bật SSL
      retryWrites: false, // Cosmos yêu cầu flag này
    }),
    TwinModule
  ],
})
export class AppModule {}

