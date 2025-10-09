import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@ApiTags('Account - Event Creator')
@Controller('/creator/account')
export class AccountCreatorController {
  @Post('/onboard')
  onboard() {}
}
