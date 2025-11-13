import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateItineraryDto } from '@/common/dto/journey/CreateItinerary.dto';
import { CreateItineraryFromAIDto } from '@/common/dto/journey/CreateItineraryFromAI.dto';
import { ItineraryResponseDto } from '@/common/dto/journey/Itinerary.response.dto';
import { UpdateItineraryDto } from '@/common/dto/journey/UpdateItinerary.dto';
import { IItineraryService } from '../app/IItinerary.service';

@ApiTags('Itinerary')
@Controller('user/itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: IItineraryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new itinerary (manual)',
    description: 'Create a new travel itinerary manually with locations',
  })
  @ApiResponse({
    status: 201,
    description: 'Itinerary created successfully',
    type: ItineraryResponseDto,
  })
  async createItinerary(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itineraryService.createItinerary(
      user.sub,
      dto,
    );

    // Transform to response DTO
    const response = plainToInstance(ItineraryResponseDto, itinerary, {
      excludeExtraneousValues: true,
    });

    return response;
  }

  @Post('from-ai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create itinerary from AI journey',
    description:
      'Convert AI journey planner response to a saved itinerary. Use this after calling /journey/ai-powered endpoint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Itinerary created from AI successfully',
    type: ItineraryResponseDto,
  })
  async createItineraryFromAI(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreateItineraryFromAIDto,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itineraryService.createItineraryFromAI(
      user.sub,
      dto,
    );
    return plainToInstance(ItineraryResponseDto, itinerary, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user itineraries',
    description: 'Get all itineraries for the authenticated user',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Number of items to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of items to skip',
  })
  @ApiResponse({
    status: 200,
    description: 'User itineraries',
    type: [ItineraryResponseDto],
  })
  async getUserItineraries(
    @AuthUser() user: JwtTokenDto,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ): Promise<{
    itineraries: ItineraryResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { itineraries, total } =
      await this.itineraryService.getUserItineraries(user.sub, +limit, +offset);

    return {
      itineraries: plainToInstance(ItineraryResponseDto, itineraries, {
        excludeExtraneousValues: true,
      }),
      total,
      limit: +limit,
      offset: +offset,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get itinerary by ID',
    description: 'Get a specific itinerary with all locations',
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerary details',
    type: ItineraryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerary not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access forbidden',
  })
  async getItineraryById(
    @AuthUser() user: JwtTokenDto,
    @Param('id') id: string,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itineraryService.getItineraryById(
      user.sub,
      id,
    );
    return plainToInstance(ItineraryResponseDto, itinerary, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update itinerary',
    description: 'Update an existing itinerary',
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerary updated successfully',
    type: ItineraryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerary not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access forbidden',
  })
  async updateItinerary(
    @AuthUser() user: JwtTokenDto,
    @Param('id') id: string,
    @Body() dto: UpdateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itineraryService.updateItinerary(
      user.sub,
      id,
      dto,
    );
    return plainToInstance(ItineraryResponseDto, itinerary, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete itinerary',
    description: 'Delete an existing itinerary',
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerary deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerary not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access forbidden',
  })
  async deleteItinerary(
    @AuthUser() user: JwtTokenDto,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.itineraryService.deleteItinerary(user.sub, id);
    return {
      success: true,
      message: 'Itinerary deleted successfully',
    };
  }
}
