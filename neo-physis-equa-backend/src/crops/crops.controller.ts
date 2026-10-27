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
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@UseGuards(JwtAuthGuard)
@Controller('api/crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createCropDto: CreateCropDto,
  ) {
    return this.cropsService.create(req.user.id, createCropDto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('farmId', new ParseUUIDPipe({ optional: true })) farmId?: string,
  ) {
    return this.cropsService.findAll(req.user.id, farmId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cropsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCropDto: UpdateCropDto,
  ) {
    return this.cropsService.update(id, req.user.id, updateCropDto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cropsService.remove(id, req.user.id);
  }
}
