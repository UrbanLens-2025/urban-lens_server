import { Injectable } from '@nestjs/common';
import {
  IFavoriteLocationQueryService,
  IFavoriteLocationQueryService_QueryConfig,
} from '../IFavoriteLocationQuery.service';
import { FavoriteLocationRepository } from '@/modules/account/infra/repository/FavoriteLocation.repository';
import { GetMyFavoritesQueryDto } from '@/common/dto/account/GetMyFavoritesQuery.dto';
import { Paginated } from 'nestjs-paginate';
import { CoreService } from '@/common/core/Core.service';
import { FavoriteLocationResponseDto } from '@/common/dto/account/res/FavoriteLocation.response.dto';

@Injectable()
export class FavoriteLocationQueryService
  extends CoreService
  implements IFavoriteLocationQueryService
{
  async getMyFavorites(
    dto: GetMyFavoritesQueryDto,
  ): Promise<Paginated<FavoriteLocationResponseDto>> {
    const favoriteLocationRepository = FavoriteLocationRepository(
      this.dataSource,
    );

    return favoriteLocationRepository
      .paginateFavoritesByAccount({
        accountId: dto.accountId,
        query: dto.query,
        queryConfig: IFavoriteLocationQueryService_QueryConfig.getMyFavorites(),
      })
      .then((res) => this.mapToPaginated(FavoriteLocationResponseDto, res));
  }
}
