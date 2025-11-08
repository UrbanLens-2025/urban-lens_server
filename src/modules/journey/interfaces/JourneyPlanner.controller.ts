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
    summary: 'Create personalized journey',
    description:
      'Generate an optimized journey based on user preferences, current location, and constraints. ' +
      'The algorithm selects locations matching user tag scores and optimizes the route for minimal travel distance.',
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
}
