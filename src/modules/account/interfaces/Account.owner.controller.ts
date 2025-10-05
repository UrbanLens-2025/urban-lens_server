import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@ApiTags('Account - Business Owner')
@Controller('/owner/account')
export class AccountOwnerController {
  @Post('/onboard')
  onboard() {}
}
