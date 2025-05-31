import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  readonly twinId: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/, {
    message: 'coordinates must be in format "latitude,longitude"',
  })
  readonly coordinates: string;
}
