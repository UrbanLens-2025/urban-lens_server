import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IRewardPointService } from '../app/IRewardPoint.service';
import { CreateRewardPointDto } from '@/common/dto/gamification/create-reward-point.dto';
import { UpdateRewardPointDto } from '@/common/dto/gamification/update-reward-point.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Reward Point')
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('reward-points')
export class RewardPointController {
  constructor(
    @Inject(IRewardPointService)
    private readonly rewardPointService: IRewardPointService,
  ) {}

  @Post()
  async createRewardPoint(@Body() dto: CreateRewardPointDto): Promise<string> {
    return this.rewardPointService.createRewardPoint(dto);
  }

  @Get()
  async getRewardPoints(): Promise<any> {
    return this.rewardPointService.getRewardPoints();
  }

  @Patch(':id')
  async updateRewardPoint(
    @Param('id') id: string,
    @Body() dto: UpdateRewardPointDto,
  ): Promise<string> {
    return this.rewardPointService.updateRewardPoint(id, dto);
  }

  @Delete(':id')
  async deleteRewardPoint(@Param('id') id: string): Promise<void> {
    return this.rewardPointService.deleteRewardPoint(id);
  }
}
