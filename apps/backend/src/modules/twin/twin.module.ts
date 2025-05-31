import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Twin, TwinSchema } from '../../database/schemas/twin.schema';
import { TwinService } from './twin.service';
import { TwinController } from './twin.controller';
import { DigitalTwinAdapter } from '../../adapters/digital-twin.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Twin.name, schema: TwinSchema }])
  ],
  controllers: [TwinController],
  providers: [TwinService, DigitalTwinAdapter],
})
export class TwinModule {}
