import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import {
  AdminMetricsResponse,
  AdminUserSummary,
} from './dto/admin-user-response.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.COLABORADOR)
  getMetrics(): Promise<AdminMetricsResponse> {
    return this.adminService.getMetrics();
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  findAllUsers(@Query() query: QueryAdminUsersDto): Promise<AdminUserSummary[]> {
    return this.adminService.findAllUsers(query);
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN)
  findOneUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminUserSummary> {
    return this.adminService.findOneUser(id);
  }

  @Patch('users/:id')
  @Roles(UserRole.ADMIN)
  updateUser(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
  ): Promise<AdminUserSummary> {
    return this.adminService.updateUser(req.user.id, id, dto);
  }
}
