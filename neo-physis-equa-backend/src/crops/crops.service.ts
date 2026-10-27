import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crop } from './entities/crop.entity';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { FarmsService } from '../farms/farms.service';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    private readonly farmsService: FarmsService,
  ) {}

  async create(ownerId: string, createCropDto: CreateCropDto): Promise<Crop> {
    // Lanza 404 si la finca no existe o no pertenece al usuario.
    await this.farmsService.findOne(createCropDto.farmId, ownerId);
    const crop = this.cropRepository.create(createCropDto);
    return await this.cropRepository.save(crop);
  }

  async findAll(ownerId: string, farmId?: string): Promise<Crop[]> {
    if (farmId) {
      await this.farmsService.findOne(farmId, ownerId);
    }
    return await this.cropRepository.find({
      where: farmId ? { farmId, farm: { ownerId } } : { farm: { ownerId } },
      order: { createdAt: 'DESC' },
      relations: { farm: true },
    });
  }

  async findOne(id: string, ownerId: string): Promise<Crop> {
    const crop = await this.cropRepository.findOne({
      where: { id, farm: { ownerId } },
      relations: { farm: true },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${id} not found`);
    }

    return crop;
  }

  async update(
    id: string,
    ownerId: string,
    updateCropDto: UpdateCropDto,
  ): Promise<Crop> {
    const crop = await this.findOne(id, ownerId);
    if (updateCropDto.farmId && updateCropDto.farmId !== crop.farmId) {
      // Solo se puede mover el cultivo a otra finca del mismo usuario.
      crop.farm = await this.farmsService.findOne(
        updateCropDto.farmId,
        ownerId,
      );
    }
    this.cropRepository.merge(crop, updateCropDto);
    return await this.cropRepository.save(crop);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const crop = await this.findOne(id, ownerId);
    await this.cropRepository.remove(crop);
  }
}
