// import { Injectable, NotFoundException } from '@nestjs/common';
// import { DigitalTwinAdapter } from '../../adapters/digital-twin.adapter';
// import { CreateFarmDto } from './dto/create-farm.dto';
// import { FarmRepository } from './repository/farm.repository';
// import { Farm } from './entities/farm.entity';

// @Injectable()
// export class FarmService {
//   constructor(
//     private readonly twinAdapter: DigitalTwinAdapter,
//     private readonly farmRepository: FarmRepository,
//   ) {}

//   async createFarm(createFarmDto: CreateFarmDto): Promise<Farm> {
//     const twinId = createFarmDto.twinId;

//     // 1. Tạo digital twin trên Azure
//     await this.twinAdapter.createDigitalTwin(twinId, {
//       $metadata: {
//         $model: 'dtmi:FarmLab:Farm;1',
//       },
//       location: createFarmDto.location,
//       coordinates: createFarmDto.coordinates,
//     });

//     // 2. Lưu vào MongoDB nếu muốn track song song
//     const saved = await this.farmRepository.create({
//       twinId,
//       location: createFarmDto.location,
//       coordinates: createFarmDto.coordinates,
//     });

//     return saved;
//   }

//   async getAllFarms(): Promise<Farm[]> {
//     return this.farmRepository.findAll();
//   }

//   async getTwinDetail(twinId: string) {
//     const twin = await this.twinAdapter.getDigitalTwin(twinId);
//     if (!twin) {
//       throw new NotFoundException(`Twin with id ${twinId} not found`);
//     }
//     return twin;
//   }

//   async deleteFarm(twinId: string): Promise<void> {
//     await this.twinAdapter.deleteDigitalTwin(twinId);
//     await this.farmRepository.deleteByTwinId(twinId);
//   }
// }
