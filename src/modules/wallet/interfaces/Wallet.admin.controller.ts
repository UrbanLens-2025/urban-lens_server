import { Role } from "@/common/constants/Role.constant";
import { Roles } from "@/common/Roles.decorator";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Controller } from "@nestjs/common";

@ApiTags('Wallet')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/wallet')
export class WalletAdminController {}