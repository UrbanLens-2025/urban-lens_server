import { Body, Controller, Delete, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IFavoriteLocationQueryService,
  IFavoriteLocationQueryService_QueryConfig,
} from '../app/IFavoriteLocationQuery.service';
import { IFavoriteLocationManagementService } from '../app/IFavoriteLocationManagement.service';
import { AddLocationToFavoritesDto } from '@/common/dto/account/AddLocationToFavorites.dto';
import { RemoveLocationFromFavoritesDto } from '@/common/dto/account/RemoveLocationFromFavorites.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Favorite Locations')
@Controller('private/location-favorites')
@ApiBearerAuth()
export class FavoriteLocationPrivateController {
  constructor(
    @Inject(IFavoriteLocationManagementService)
    private readonly favoriteLocationManagementService: IFavoriteLocationManagementService,
    @Inject(IFavoriteLocationQueryService)
    private readonly favoriteLocationQueryService: IFavoriteLocationQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a location to favorites' })
  addToFavorites(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: AddLocationToFavoritesDto,
  ) {
    dto.accountId = user.sub;
    return this.favoriteLocationManagementService.addToFavorites(dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a location from favorites' })
  removeFromFavorites(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: RemoveLocationFromFavoritesDto,
  ) {
    dto.accountId = user.sub;
    return this.favoriteLocationManagementService.removeFromFavorites(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my favorite locations' })
  @ApiPaginationQuery(
    IFavoriteLocationQueryService_QueryConfig.getMyFavorites(),
  )
  getMyFavorites(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.favoriteLocationQueryService.getMyFavorites({
      query,
      accountId: user.sub,
    });
  }
}
