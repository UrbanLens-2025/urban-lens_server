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

  @Post('onboard')
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Business owner onboarding - Register business for approval',
    description:
      'Business owners must register their business and wait for admin approval to complete onboarding',
  })
  @ApiResponse({
    status: 201,
    description: 'Business registration submitted for approval',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Business already registered or invalid data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only business owners can register business',
  })
  async registerBusiness(
    @AuthUser() user: JwtTokenDto,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    const business = await this.businessService.createBusiness(
      user.sub,
      createBusinessDto,
    );

    return business;
  }

  @Get('onboard-status')
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Check business onboarding status',
    description:
      'Check if business registration is pending, approved, or rejected',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved',
    type: SuccessResponseDto,
  })
  async getOnboardingStatus(@AuthUser() user: JwtTokenDto) {
    const business = await this.businessService.getBusinessById(user.sub);

    return business;
  }

  @Patch('onboard/:businessId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update business onboarding status',
    description: 'Update business onboarding status',
  })
  async updateOnboardingStatus(
    @AuthUser() user: JwtTokenDto,
    @Body() updateBusinessDto: UpdateBusinessStatusDto,
    @Param('businessId') businessId: string,
  ) {
    return this.businessService.updateBusinessStatus(
      businessId,
      updateBusinessDto,
      user.sub,
    );
  }
}
