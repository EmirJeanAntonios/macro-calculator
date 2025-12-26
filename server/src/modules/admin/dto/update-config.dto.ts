import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfigItemDto {
  @IsString()
  key: string;

  @IsNumber()
  value: number;
}

export class UpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigItemDto)
  configs: ConfigItemDto[];
}

