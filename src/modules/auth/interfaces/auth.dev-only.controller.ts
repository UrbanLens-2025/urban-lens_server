import { Controller, Inject, Post } from '@nestjs/common';
import { AccountSeederHelper } from '@/modules/auth/app/helper/AccountSeeder.helper';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '@/common/dto/auth/Login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/common/constants/Role.constant';
import { IAuthService } from '@/modules/auth/app/IAuth.service';

@ApiTags('_Development')
@Controller('/auth/dev-only')
export class AuthDevOnlyController {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
    private readonly accountSeederHelper: AccountSeederHelper,
  ) {}

  @ApiOperation({ summary: 'Get User JWT Token' })
  @Post('/login/user')
  loginAsUser() {
    const userDetails = this.accountSeederHelper.DEFAULT_USERS.find(
      (i) => i.role === Role.USER,
    );
    console.log(userDetails);
    const loginDto = plainToInstance(LoginDto, userDetails);
    return this.authService.loginUser(loginDto);
  }

  @ApiOperation({ summary: 'Get Admin JWT Token' })
  @Post('/login/admin')
  loginAsAdmin() {
    const adminDetails = this.accountSeederHelper.DEFAULT_USERS.find(
      (i) => i.role === Role.ADMIN,
    );
    const loginDto = plainToInstance(LoginDto, adminDetails);
    return this.authService.loginUser(loginDto);
  }

  @ApiOperation({ summary: 'Get Business Owner JWT Token' })
  @Post('/login/business-owner')
  loginAsBusinessOwner() {
    const businessOwnerDetails = this.accountSeederHelper.DEFAULT_USERS.find(
      (i) => i.role === Role.BUSINESS_OWNER,
    );
    const loginDto = plainToInstance(LoginDto, businessOwnerDetails);
    console.log(loginDto);
    return this.authService.loginUser(loginDto);
  }

  @ApiOperation({ summary: 'Get Event Creator JWT Token' })
  @Post('/login/event-creator')
  loginAsEventCreator() {
    const eventCreatorDetails = this.accountSeederHelper.DEFAULT_USERS.find(
      (i) => i.role === Role.EVENT_CREATOR,
    );
    const loginDto = plainToInstance(LoginDto, eventCreatorDetails);
    return this.authService.loginUser(loginDto);
  }
}
