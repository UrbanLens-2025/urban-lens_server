import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { GetCheckInsQueryDto } from '@/common/dto/checkin/GetCheckInsQuery.dto';
import { ICheckInService } from '../app/ICheckIn.service';
import { SuccessResponseDto } from '@/common/dto/SuccessResponse.dto';
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { RolesGuard } from '@/common/Roles.guard';
import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { AuthUser } from '@/common/AuthUser.decorator';

@ApiTags('Check-ins')
@Controller('checkins')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CheckInController {
  constructor(
    @Inject(ICheckInService)
    private readonly checkInService: ICheckInService,
  ) {}

  @Post()
  @Roles(Role.USER, Role.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Create a new check-in' })
  @ApiResponse({
    status: 201,
    description: 'Check-in created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Already have active check-in',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found or not approved',
  })
  async createCheckIn(
    @AuthUser() user: any,
    @Body() createCheckInDto: CreateCheckInDto,
  ) {
    const checkIn = await this.checkInService.createCheckIn(
      user.id,
      createCheckInDto,
    );
    return checkIn;
  }

  //   @Get('active')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER)
  //   @ApiOperation({ summary: 'Get my active check-in' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Active check-in retrieved successfully',
  //     type: SuccessResponseDto,
  //   })
  //   async getActiveCheckIn(@GetCurrentUser('id') userId: string) {
  //     const checkIn = await this.checkInService.getActiveCheckIn(userId);
  //     return new SuccessResponseDto('Active check-in retrieved successfully', checkIn);
  //   }

  //   @Get('location/:locationId')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER, Role.ADMIN)
  //   @ApiOperation({ summary: 'Get check-ins by location ID' })
  //   @ApiParam({ name: 'locationId', description: 'Location ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Location check-ins retrieved successfully',
  //     type: SuccessResponseDto,
  //   })
  //   async getCheckInsByLocationId(
  //     @Param('locationId') locationId: string,
  //     @Query() queryDto: GetCheckInsQueryDto,
  //   ) {
  //     const result = await this.checkInService.getCheckInsByLocationId(locationId, queryDto);
  //     return new SuccessResponseDto('Location check-ins retrieved successfully', result);
  //   }

  //   @Get(':id')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER, Role.ADMIN)
  //   @ApiOperation({ summary: 'Get check-in by ID' })
  //   @ApiParam({ name: 'id', description: 'Check-in ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Check-in retrieved successfully',
  //     type: SuccessResponseDto,
  //   })
  //   @ApiResponse({ status: 404, description: 'Check-in not found' })
  //   async getCheckInById(@Param('id') checkInId: string) {
  //     const checkIn = await this.checkInService.getCheckInById(checkInId);
  //     return new SuccessResponseDto('Check-in retrieved successfully', checkIn);
  //   }

  //   @Put(':id')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER)
  //   @ApiOperation({ summary: 'Update check-in (notes, rating)' })
  //   @ApiParam({ name: 'id', description: 'Check-in ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Check-in updated successfully',
  //     type: SuccessResponseDto,
  //   })
  //   @ApiResponse({ status: 403, description: 'Forbidden - Can only update own check-ins' })
  //   @ApiResponse({ status: 404, description: 'Check-in not found' })
  //   async updateCheckIn(
  //     @Param('id') checkInId: string,
  //     @GetCurrentUser('id') userId: string,
  //     @Body() updateCheckInDto: UpdateCheckInDto,
  //   ) {
  //     const checkIn = await this.checkInService.updateCheckIn(checkInId, userId, updateCheckInDto);
  //     return new SuccessResponseDto('Check-in updated successfully', checkIn);
  //   }

  //   @Put(':id/checkout')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER)
  //   @ApiOperation({ summary: 'Check out (end active check-in)' })
  //   @ApiParam({ name: 'id', description: 'Check-in ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Checked out successfully',
  //     type: SuccessResponseDto,
  //   })
  //   @ApiResponse({ status: 400, description: 'Bad Request - Check-in already inactive' })
  //   @ApiResponse({ status: 403, description: 'Forbidden - Can only check out own check-ins' })
  //   @ApiResponse({ status: 404, description: 'Check-in not found' })
  //   async checkOut(
  //     @Param('id') checkInId: string,
  //     @GetCurrentUser('id') userId: string,
  //   ) {
  //     const checkIn = await this.checkInService.checkOut(checkInId, userId);
  //     return new SuccessResponseDto('Checked out successfully', checkIn);
  //   }

  //   @Delete(':id')
  //   @Roles(Role.USER, Role.BUSINESS_OWNER)
  //   @ApiOperation({ summary: 'Delete check-in' })
  //   @ApiParam({ name: 'id', description: 'Check-in ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Check-in deleted successfully',
  //     type: SuccessResponseDto,
  //   })
  //   @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own check-ins' })
  //   @ApiResponse({ status: 404, description: 'Check-in not found' })
  //   async deleteCheckIn(
  //     @Param('id') checkInId: string,
  //     @GetCurrentUser('id') userId: string,
  //   ) {
  //     await this.checkInService.deleteCheckIn(checkInId, userId);
  //     return new SuccessResponseDto('Check-in deleted successfully', null);
  //   }
}
