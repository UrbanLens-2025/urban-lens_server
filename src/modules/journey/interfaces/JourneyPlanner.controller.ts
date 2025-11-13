import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from 'src/common/AuthUser.decorator';
import { JwtAuthGuard } from 'src/common/JwtAuth.guard';
import { JwtTokenDto } from 'src/common/dto/JwtToken.dto';
import { CreatePersonalJourneyDto } from 'src/common/dto/journey/CreatePersonalJourney.dto';
import { PersonalJourneyResponseDto } from 'src/common/dto/journey/PersonalJourneyResponse.dto';
import { AIJourneyResponseDto } from 'src/common/dto/journey/AIJourneyResponse.dto';
import { IJourneyPlannerService } from '../app/IJourneyPlanner.service';

@ApiTags('Journey Planning')
@Controller('journey')
export class JourneyPlannerController {
  constructor(
    @Inject(IJourneyPlannerService)
    private readonly journeyPlannerService: IJourneyPlannerService,
  ) {}

  @Post('personal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create personalized journey (Algorithm-based)',
    description:
      'Generate an optimized journey using algorithmic approach. ' +
      'Fast and predictable. Selects locations matching user tag scores and optimizes route for minimal travel distance.',
  })
  @ApiOkResponse({
    description: 'Successfully created personalized journey',
    type: PersonalJourneyResponseDto,
  })
  async createPersonalJourney(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreatePersonalJourneyDto,
  ): Promise<PersonalJourneyResponseDto> {
    return this.journeyPlannerService.createPersonalJourney(user.sub, dto);
  }

  @Post('ai-powered')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create AI-powered journey (Experimental)',
    description:
      'Generate a journey where AI queries the database and intelligently plans the route. ' +
      'Requires OLLAMA_ENABLED=true. Slower but provides detailed reasoning and tips. ' +
      'AI will analyze locations, consider user preferences, and suggest optimal order.',
  })
  @ApiOkResponse({
    description: 'Successfully created AI-powered journey',
    type: AIJourneyResponseDto,
  })
  async createAIPoweredJourney(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreatePersonalJourneyDto,
  ): Promise<AIJourneyResponseDto> {
    return this.journeyPlannerService.createAIPoweredJourney(user.sub, dto);
  }
}
