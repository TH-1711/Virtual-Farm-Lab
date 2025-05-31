import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { model, Model } from 'mongoose';
import { DigitalTwinAdapter } from '../../adapters/digital-twin.adapter';
import { CreateTwinDto, UpdateTwinDto } from './dto/twin.dto';
import { Twin } from '../../database/schemas/twin.schema';
import * as fs from 'fs';
import * as path from 'path';
import { DigitalTwinsModelData } from '@azure/digital-twins-core';


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
    return await this.twinAdapter.queryAllTwins();
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
}
