import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Not, Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: RegisterDto): Promise<User> {
    const user = this.userRepository.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: dto.name,
      role: dto.role,
      accessibilityProfile: dto.accessibilityProfile ?? {},
      disabilityType: dto.disabilityType ?? null,
    });
    return this.userRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.nombre !== undefined) {
      user.name = dto.nombre.trim();
    }

    if (dto.disabilityType !== undefined) {
      user.disabilityType = dto.disabilityType;
    }

    if (dto.accessibilityProfile !== undefined) {
      user.accessibilityProfile = {
        ...(user.accessibilityProfile ?? {}),
        ...dto.accessibilityProfile,
      };
    }

    return this.userRepository.save(user);
  }

  async guardarTokenPush(id: string, token: string | null): Promise<void> {
    if (token !== null) {
      await this.userRepository.update(
        { pushToken: token, id: Not(id) },
        { pushToken: null },
      );
    }

    await this.userRepository.update({ id }, { pushToken: token });
  }

  async tokenPush(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, pushToken: true },
    });
    return user?.pushToken ?? null;
  }
}
