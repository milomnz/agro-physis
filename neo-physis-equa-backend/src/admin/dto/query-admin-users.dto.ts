import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class QueryAdminUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Rol de filtro inválido' })
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'El estado debe ser active o inactive',
  })
  status?: 'active' | 'inactive';
}
