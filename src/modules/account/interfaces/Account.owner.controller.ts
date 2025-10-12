import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { IBusinessService } from '../app/IBusiness.service';
import { SuccessResponseDto } from '@/common/dto/SuccessResponse.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';

@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@ApiTags('Account - Business Owner')
@Controller('/account/owner')
export class AccountOwnerController {
  constructor(
    @Inject(IBusinessService)
    private readonly businessService: IBusinessService,
  ) {}

  @Post('/onboard')
  @ApiOperation({ summary: 'Onboard business owner' })
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
    summary: 'Update business onboarding status (Only Admin)',
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
