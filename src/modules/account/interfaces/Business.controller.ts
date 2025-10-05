import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { GetBusinessesQueryDto } from '@/common/dto/business/GetBusinessesQuery.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Inject,
  Query,
} from '@nestjs/common';
import { IBusinessService } from '../app/IBusiness.service';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
  constructor(
    @Inject(IBusinessService)
    private readonly businessService: IBusinessService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business' })
  @Roles(Role.BUSINESS_OWNER)
  createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    createBusinessDto.accountId = user.sub;
    return this.businessService.createBusiness(createBusinessDto);
  }

  @Get()
  // @Roles(Role.BUSINESS_OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get businesses with pagination and filters',
    description:
      'Filter by status (PENDING, APPROVED, REJECTED) and search by name',
  })
  getBusinessesWithPagination(@Query() queryParams: GetBusinessesQueryDto) {
    return this.businessService.getBusinessesWithPagination(queryParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID' })
  getBusinessById(@Param('id') id: string) {
    return this.businessService.getBusinessById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Update business information (Business Owner only)',
    description:
      'Business owner can update their business info, especially after rejection with admin notes',
  })
  updateBusiness(
    @Param('id') businessId: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.businessService.updateBusiness(
      businessId,
      updateBusinessDto,
      user.sub,
    );
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update business status (Admin only)',
    description:
      'Admin can approve, reject, or change status. Admin notes required for rejection.',
  })
  updateBusinessStatus(
    @Param('id') businessId: string,
    @Body() updateStatusDto: UpdateBusinessStatusDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    return this.businessService.updateBusinessStatus(
      businessId,
      updateStatusDto,
      admin.sub,
    );
  }
}
