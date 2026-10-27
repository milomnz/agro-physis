import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PestsService } from './pests.service';
import { CreatePestDto } from './dto/create-pest.dto';
import { UpdatePestDto } from './dto/update-pest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@UseGuards(JwtAuthGuard)
@Controller('api/pests')
export class PestsController {
  constructor(private readonly pestsService: PestsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createPestDto: CreatePestDto,
  ) {
    return this.pestsService.create(req.user.id, createPestDto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('cropId', new ParseUUIDPipe({ optional: true })) cropId?: string,
  ) {
    return this.pestsService.findAll(req.user.id, cropId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pestsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePestDto: UpdatePestDto,
  ) {
    return this.pestsService.update(id, req.user.id, updatePestDto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pestsService.remove(id, req.user.id);
  }
}
