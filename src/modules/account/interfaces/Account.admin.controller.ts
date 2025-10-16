import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiTags('Account')
@Controller('/admin/account')
export class AccountAdminController {}
