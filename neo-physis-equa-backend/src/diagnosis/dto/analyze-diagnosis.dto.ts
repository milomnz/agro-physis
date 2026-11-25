import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AnalyzeDiagnosisDto {
  @IsUUID()
  @IsNotEmpty()
  cropId: string;

  @IsObject()
  answers: Record<string, string>;

  @IsString()
  @IsOptional()
  imageBase64?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}
