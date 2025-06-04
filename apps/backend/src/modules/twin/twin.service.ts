import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { model, Model } from 'mongoose';
import { DigitalTwinAdapter } from '../../adapters/digital-twin.adapter';
import { CreateTwinDto, UpdateTwinDto } from './dto/twin.dto';
import { Twin } from '../../database/schemas/twin.schema';
import * as fs from 'fs';
import * as path from 'path';
import { DigitalTwinsModelData } from '@azure/digital-twins-core';

function random(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

@Injectable()
export class TwinService {
  private readonly logger = new Logger(TwinService.name);

  constructor(
    private readonly twinAdapter: DigitalTwinAdapter,
    @InjectModel(Twin.name) private readonly twinModel: Model<Twin>,
  ) {}

  async createTwin(dto: CreateTwinDto): Promise<void> {
    const twinPayload = {
      $metadata: { $model: dto.modelId },
      ...dto.properties,
    };

    try {
      // 1. Gửi lên Azure Digital Twin
      await this.twinAdapter.createDigitalTwin(dto.twinId, twinPayload);

      // 2. Lưu metadata vào MongoDB
      const twin = new this.twinModel({
        twinId: dto.twinId,
        modelId: dto.modelId,
        properties: dto.properties,
      });
      await twin.save();
    } catch (error) {
      this.logger.error(`Failed to create twin "${dto.twinId}": ${error.message}`);
      throw new InternalServerErrorException('Failed to create twin');
    }
  }

  async updateTwin(dto: UpdateTwinDto): Promise<void> {
    try {
      // 1. Gửi patch lên Azure ADT
      await this.twinAdapter.updateDigitalTwin(dto.twinId, dto.patch);

      // 2. Cập nhật fields tương ứng trong DB
      const updateData = dto.patch.reduce((acc, op) => {
        if (op.op === 'replace' && op.path.startsWith('/')) {
          acc[`properties.${op.path.slice(1)}`] = op.value;
        }
        return acc;
      }, {} as Record<string, any>);

      await this.twinModel.updateOne({ twinId: dto.twinId }, { $set: updateData });
    } catch (error) {
      this.logger.error(`Failed to update twin "${dto.twinId}": ${error.message}`);
      throw new InternalServerErrorException('Failed to update twin');
    }
  }

  async deleteTwin(twinId: string): Promise<void> {
    try {
      // 1. Xóa khỏi ADT
      await this.twinAdapter.deleteDigitalTwin(twinId);

      // 2. Xóa khỏi MongoDB
      await this.twinModel.deleteOne({ twinId });
    } catch (error) {
      this.logger.error(`Failed to delete twin "${twinId}": ${error.message}`);
      throw new InternalServerErrorException('Failed to delete twin');
    }
  }

  async getTwin(twinId: string): Promise<any> {
    try {
      return await this.twinAdapter.getDigitalTwin(twinId);
    } catch (error) {
      this.logger.error(`Failed to fetch twin "${twinId}": ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch twin');
    }
  }

  async getAllTwins(): Promise<any[]> {
  try {
    const res = await this.twinAdapter.queryAllTwins();
    await this.twinModel.bulkWrite(
  res.map(twin => ({
    updateOne: {
      filter: { twinId: twin.$dtId },
      update: {
        $setOnInsert: {
          twinId: twin.$dtId,
          modelId: twin.$metadata.$model,
          properties: twin,
        },
      },
      upsert: true,
    },
  }))
);

    return res;
  } catch (error) {
    this.logger.error(`Failed to fetch all twins from ADT: ${error.message}`);
    throw new InternalServerErrorException('Failed to fetch all twins from ADT');
  }
}

  async uploadModel(data: Record<string, any>): Promise<void> {
    try {
        const modelArray = Array.isArray(data) ? data : [data];
      await this.twinAdapter.uploadModel(modelArray);
      console.log(data);
      this.logger.log(`Uploaded model: ${data['@id'] || data['$id'] || 'unknown'}`);
    } catch (error) {
      this.logger.error(`Failed to upload model: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload model');
    }
  }

    async deleteModel(modelId: string): Promise<void> {
        try {
        await this.twinAdapter.deleteModel(modelId);
        this.logger.log(`Deleted model: ${modelId}`);
        } catch (error) {
        this.logger.error(`Failed to delete model "${modelId}": ${error.message}`);
        throw new InternalServerErrorException('Failed to delete model');
        }
    }

    async initialModels(): Promise<void> {
        const modelsDir = path.join(__dirname, '../../models');
        const files = fs.readdirSync(modelsDir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(modelsDir, file);
                const modelData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DigitalTwinsModelData;
                try {
                    await this.twinAdapter.uploadModel(modelData);
                    this.logger.log(`Uploaded model: ${modelData['@id']}`);
                } catch (error) {
                    this.logger.error(`Failed to upload model from ${file}: ${error.message}`);
                }
            }
        }
    }


    async mockUpdateAllTwins(): Promise<void> {
    const twins = await this.getAllTwins(); // returns all twins from ADT

    for (const twin of twins) {
      const twinId = twin.$dtId;
      const model = twin.$metadata?.$model;

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
        console.log(`🔄 Updating twinId: ${twinId}`);
      console.log(`📘 Model: ${model}`);
      console.log(`🛠️ Patch:`, patch);
        await this.updateTwin({ twinId, patch });
      }
    }
  }
}
