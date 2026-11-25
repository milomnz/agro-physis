import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CropsModule } from '../crops/crops.module';
import { PestsModule } from '../pests/pests.module';
import { CloudinaryService } from './cloudinary.service';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

@Module({
  imports: [ConfigModule, CropsModule, PestsModule],
  controllers: [DiagnosisController],
  providers: [CloudinaryService, DiagnosisService],
  exports: [DiagnosisService, CloudinaryService],
})
export class DiagnosisModule {}
