import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IRankService } from '../app/IRank.service';
import { CreateRankDto } from '@/common/dto/gamification/create-rank.dto';
import { UpdateRankDto } from '@/common/dto/gamification/update-rank.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Rank')
@ApiBearerAuth()
@Controller('rank')
export class RankController {
  constructor(
    @Inject(IRankService) private readonly rankService: IRankService,
  ) {}

  @ApiOperation({ summary: 'Create new rank (Admin only)' })
  @Post()
  @Roles(Role.ADMIN)
  async createRank(@Body() dto: CreateRankDto) {
    return await this.rankService.createRank(dto);
  }

  @ApiOperation({ summary: 'Get all ranks' })
  @Get()
  async getRanks() {
    return await this.rankService.getRanks();
  }

  @ApiOperation({ summary: 'Get rank by ID' })
  @Get(':id')
  async getRankById(@Param('id') id: string) {
    return await this.rankService.getRankById(id);
  }

  @ApiOperation({ summary: 'Get rank by points' })
  @Get('by-points/:points')
  async getRankByPoints(@Param('points') points: number) {
    return await this.rankService.getRankByPoints(points);
  }

  @ApiOperation({ summary: 'Delete rank (Admin only)' })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteRank(@Param('id') id: string) {
    return await this.rankService.deleteRank(id);
  }
}
