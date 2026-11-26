import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'El rol debe ser productor, colaborador o admin',
  })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}
