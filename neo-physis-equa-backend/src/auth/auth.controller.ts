import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
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
}