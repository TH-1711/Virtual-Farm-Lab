import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Patch operation object (for JSON Patch)
class PatchOperation {
  @IsString()
  @IsNotEmpty()
  op: 'replace' | 'add' | 'remove';

  @IsString()
  @IsNotEmpty()
  path: string;

  value: any;
}

export class CreateTwinDto {
  @IsString()
  @IsNotEmpty()
  readonly twinId: string;

  @IsString()
  @IsNotEmpty()
  readonly modelId: string;

  @IsObject()
  @IsNotEmpty()
  readonly properties: Record<string, any>;
}

export class UpdateTwinDto {
  @IsString()
  @IsNotEmpty()
  readonly twinId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchOperation)
  readonly patch: PatchOperation[];
}

export class DeleteTwinDto {
  @IsString()
  @IsNotEmpty()
  readonly twinId: string;
}

export class GetTwinDto {
  @IsString()
  @IsNotEmpty()
  readonly twinId: string;
}
