import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pest } from './entities/pest.entity';
import { PestsService } from './pests.service';
import { PestsController } from './pests.controller';
import { CropsModule } from '../crops/crops.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pest]), CropsModule],
  controllers: [PestsController],
  providers: [PestsService],
  exports: [TypeOrmModule, PestsService],
})
export class PestsModule {}
