import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TwinService } from './twin.service';
import { CreateTwinDto, UpdateTwinDto } from './dto/twin.dto';

@Controller('twin')
export class TwinController {
  constructor(private readonly twinService: TwinService) {}

  @Get()
    findAll() {
        return this.twinService.getAllTwins();
    }

  @Post()
  create(@Body() dto: CreateTwinDto) {
    return this.twinService.createTwin(dto);
  }

  @Patch()
  update(@Body() dto: UpdateTwinDto) {
    return this.twinService.updateTwin(dto);
  }

  @Delete(':twinId')
  delete(@Param('twinId') twinId: string) {
    return this.twinService.deleteTwin(twinId);
  }

  @Get(':twinId')
  findOne(@Param('twinId') twinId: string) {
    return this.twinService.getTwin(twinId);
  }

  @Post('model/upload')
uploadModel(@Body() body: any) {
  return this.twinService.uploadModel(body);
}

@Post('model/init')
initialModels() {
  return this.twinService.initialModels();
}

@Delete('model/:id')
deleteModel(@Param('id') id: string) {
  return this.twinService.deleteModel(id);
}

  @Post('mock-data')
  async mockAllTwins() {
    await this.twinService.mockUpdateAllTwins();
    return { message: 'Mock data applied to all applicable twins' };
  }

}
