import { Body, Controller, Inject, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';

@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@ApiTags('Account')
@Controller('/owner/account')
export class AccountOwnerController {
  constructor(
    @Inject(IAccountProfileManagementService)
    private readonly accountProfileManagementService: IAccountProfileManagementService,
    @Inject(IOnboardService)
    private readonly onboardService: IOnboardService,
  ) {}

  @Post('/onboard')
  @ApiOperation({ summary: 'Onboard business owner' })
  async registerBusiness(
    @AuthUser() user: JwtTokenDto,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    return await this.onboardService.onboardOwner(user.sub, createBusinessDto);
  }

  @Put('/profile/pre-approval')
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Update business profile information',
    description:
      'Business owner can update their business info, especially after rejection with admin notes',
  })
  updateBusiness(
    @Body() updateBusinessDto: UpdateBusinessDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.accountProfileManagementService.updateBusinessBeforeApproval(
      updateBusinessDto,
      user.sub,
    );
  }
}
