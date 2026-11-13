import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pest } from './entities/pest.entity';
import { CreatePestDto } from './dto/create-pest.dto';
import { UpdatePestDto } from './dto/update-pest.dto';
import { CropsService } from '../crops/crops.service';

@Injectable()
export class PestsService {
  constructor(
    @InjectRepository(Pest)
    private readonly pestRepository: Repository<Pest>,
    private readonly cropsService: CropsService,
  ) {}

  async create(ownerId: string, createPestDto: CreatePestDto): Promise<Pest> {
    // Lanza 404 si el cultivo no existe o no está en una finca del usuario.
    await this.cropsService.findOne(createPestDto.cropId, ownerId);
    const pest = this.pestRepository.create(createPestDto);
    return await this.pestRepository.save(pest);
  }

  async findAll(ownerId: string, cropId?: string): Promise<Pest[]> {
    if (cropId) {
      await this.cropsService.findOne(cropId, ownerId);
    }
    const ownedCrop = { farm: { ownerId } };
    return await this.pestRepository.find({
      where: cropId ? { cropId, crop: ownedCrop } : { crop: ownedCrop },
      order: { createdAt: 'DESC' },
      relations: { crop: true },
    });
  }

  async findOne(id: string, ownerId: string): Promise<Pest> {
    const pest = await this.pestRepository.findOne({
      where: { id, crop: { farm: { ownerId } } },
      relations: { crop: true },
    });

    if (!pest) {
      throw new NotFoundException(`Pest with ID ${id} not found`);
    }

    return pest;
  }

  async update(
    id: string,
    ownerId: string,
    updatePestDto: UpdatePestDto,
  ): Promise<Pest> {
    const pest = await this.findOne(id, ownerId);
    if (updatePestDto.cropId && updatePestDto.cropId !== pest.cropId) {
      // Solo se puede mover la plaga a otro cultivo del mismo usuario.
      pest.crop = await this.cropsService.findOne(
        updatePestDto.cropId,
        ownerId,
      );
    }
    this.pestRepository.merge(pest, updatePestDto);
    return await this.pestRepository.save(pest);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const pest = await this.findOne(id, ownerId);
    await this.pestRepository.remove(pest);
  }
}
