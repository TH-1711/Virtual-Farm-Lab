import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TwinService } from './modules/twin/twin.service';
import { UpdateTwinDto } from './modules/twin/dto/twin.dto';

function random(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const twinService = app.get(TwinService);

  console.log('📌 Initializing models...');
  await twinService.initialModels();

  console.log('📌 Fetching all twins...');
  const twins = await twinService.getAllTwins();

  for (const twin of twins) {
    const twinId: string = twin.$dtId;
    const model: string = twin.$metadata?.$model;

    let patch: UpdateTwinDto['patch'] = [];

    if (model?.includes('Environment')) {
      patch = [
        { op: 'replace', path: '/temperature', value: random(20, 35) },
        { op: 'replace', path: '/humidity', value: random(30, 80) },
        { op: 'replace', path: '/co2', value: random(300, 600) },
        { op: 'replace', path: '/oxygen', value: random(18, 22) },
        { op: 'replace', path: '/lightIntensity', value: random(100, 1000) },
      ];
    } else if (model?.includes('Soil')) {
      patch = [
        { op: 'replace', path: '/moistureLevel', value: random(20, 80) },
        { op: 'replace', path: '/temperature', value: random(15, 35) },
        { op: 'replace', path: '/pHLevel', value: random(5.5, 7.5) },
        { op: 'replace', path: '/nutrientLevel', value: random(10, 100) },
        { op: 'replace', path: '/salinityLevel', value: random(1, 10) },
      ];
    } else if (model?.includes('WeatherStation')) {
      patch = [
        { op: 'replace', path: '/temperature', value: random(280, 310) },
        { op: 'replace', path: '/humidity', value: random(10, 90) },
        { op: 'replace', path: '/windSpeed', value: random(0, 10) },
        { op: 'replace', path: '/windDirection', value: Math.floor(random(0, 360)) },
        { op: 'replace', path: '/windGustLevel', value: random(0, 10) },
      ];
    } else if (model?.includes('Plant')) {
      patch = [
        {
          op: 'replace',
          path: '/growthStage',
          value: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting'][Math.floor(Math.random() * 4)],
        },
      ];
    }

    if (patch.length > 0) {
      console.log(`🔄 Updating ${twinId} (${model})`);
      await twinService.updateTwin({ twinId, patch });
    }
  }

  console.log('✅ Mock data update completed.');
  await app.close();
}

bootstrap();
