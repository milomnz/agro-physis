import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { DiagnosisService } from './diagnosis.service';
import { AnalyzeDiagnosisDto } from './dto/analyze-diagnosis.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@UseGuards(JwtAuthGuard)
@Controller('api/diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  analyze(@Req() req: AuthenticatedRequest, @Body() dto: AnalyzeDiagnosisDto) {
    return this.diagnosisService.analyze(req.user.id, dto);
  }
}
