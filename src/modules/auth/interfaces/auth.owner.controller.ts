import {
  Controller,
  Post,
  Body,
  UseGuards,
  Inject,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { RolesGuard } from '@/common/Roles.guard';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { IBusinessService } from '@/modules/account/app/IBusiness.service';
import { SuccessResponseDto } from '@/common/dto/SuccessResponse.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';

@ApiTags('Auth - Business Owner')
@Controller('auth/business-owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuthBusinessOwnerController {
  constructor(
    @Inject(IBusinessService)
    private readonly businessService: IBusinessService,
  ) {}
}
