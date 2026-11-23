import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pest } from './entities/pest.entity';
import { PestsService } from './pests.service';
import { PestsController } from './pests.controller';
import { CropsModule } from '../crops/crops.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pest]), CropsModule, NotificationsModule],
  controllers: [PestsController],
  providers: [PestsService],
  exports: [TypeOrmModule, PestsService],
})
export class PestsModule {}
