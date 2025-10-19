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
@ApiTags('Account')
@Controller('/owner/account')
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
