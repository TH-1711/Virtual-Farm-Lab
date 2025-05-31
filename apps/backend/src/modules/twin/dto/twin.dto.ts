import { IsString, IsNotEmpty, IsObject, Matches } from 'class-validator';

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

  @IsObject()
  @IsNotEmpty()
  readonly patch: Array<{ op: string; path: string; value: any }>;
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
