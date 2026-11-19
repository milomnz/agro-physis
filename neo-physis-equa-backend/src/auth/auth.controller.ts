import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { PushTokenDto } from './dto/push-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.registro(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest): Promise<AuthResponse> {
    return this.authService.perfil(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthResponse> {
    return this.authService.actualizarPerfil(req.user.id, dto);
  }

  @Put('push-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async guardarPushToken(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PushTokenDto,
  ): Promise<void> {
    await this.authService.guardarTokenPush(req.user.id, dto.token);
  }

  @Delete('push-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarPushToken(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.authService.guardarTokenPush(req.user.id, null);
  }
}
