import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pest, Severity } from './entities/pest.entity';
import { CreatePestDto } from './dto/create-pest.dto';
import { UpdatePestDto } from './dto/update-pest.dto';
import { CropsService } from '../crops/crops.service';
import {
  NOTIFICADOR_PORT,
  type Notificador,
} from '../notifications/ports/notificador.port';

@Injectable()
export class PestsService {
  private readonly logger = new Logger(PestsService.name);

  constructor(
    @InjectRepository(Pest)
    private readonly pestRepository: Repository<Pest>,
    private readonly cropsService: CropsService,
    @Inject(NOTIFICADOR_PORT)
    private readonly notificador: Notificador,
  ) {}

  async create(ownerId: string, createPestDto: CreatePestDto): Promise<Pest> {
    // Lanza 404 si el cultivo no existe o no está en una finca del usuario.
    const crop = await this.cropsService.findOne(createPestDto.cropId, ownerId);
    const pest = this.pestRepository.create(createPestDto);
    const saved = await this.pestRepository.save(pest);

    if (this.debeNotificarSeveridad(saved.severity)) {
      await this.enviarAlertaPlaga(ownerId, saved, crop?.species, 'create');
    }

    return saved;
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
    const previousSeverity = pest.severity;

    if (updatePestDto.cropId && updatePestDto.cropId !== pest.cropId) {
      // Solo se puede mover la plaga a otro cultivo del mismo usuario.
      pest.crop = await this.cropsService.findOne(
        updatePestDto.cropId,
        ownerId,
      );
    }
    this.pestRepository.merge(pest, updatePestDto);
    const saved = await this.pestRepository.save(pest);

    if (
      saved.severity !== previousSeverity &&
      this.debeNotificarSeveridad(saved.severity)
    ) {
      await this.enviarAlertaPlaga(
        ownerId,
        saved,
        saved.crop?.species ?? pest.crop?.species,
        'update',
      );
    }

    return saved;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const pest = await this.findOne(id, ownerId);
    await this.pestRepository.remove(pest);
  }

  private debeNotificarSeveridad(
    severity: Severity | undefined,
  ): severity is Severity.MEDIA | Severity.ALTA {
    return severity === Severity.MEDIA || severity === Severity.ALTA;
  }

  private async enviarAlertaPlaga(
    ownerId: string,
    pest: Pest,
    cropSpecies: string | undefined,
    evento: 'create' | 'update',
  ): Promise<void> {
    const nivel = pest.severity === Severity.ALTA ? 'alta' : 'media';
    const cropName = cropSpecies?.trim();
    const titulo = cropName
      ? `Alerta ${nivel} en ${cropName}`
      : `Alerta ${nivel} de plaga`;
    const cuerpo =
      evento === 'create'
        ? `Se registró ${pest.commonName}. Toca para ver el detalle.`
        : `Se actualizó ${pest.commonName} a severidad ${nivel}. Toca para ver el detalle.`;

    try {
      await this.notificador.avisar(ownerId, {
        titulo,
        cuerpo,
        datos: {
          tipo: 'pest',
          pestId: pest.id,
          cropId: pest.cropId,
          severity: pest.severity,
          route: `/pests/${pest.id}`,
        },
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar la notificación push para la plaga ${pest.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
