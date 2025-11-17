import { GetMyFavoritesQueryDto } from '@/common/dto/account/GetMyFavoritesQuery.dto';
import { Paginated, PaginateConfig } from 'nestjs-paginate';
import { FavoriteLocationEntity } from '@/modules/account/domain/FavoriteLocation.entity';
import { FavoriteLocationResponseDto } from '@/common/dto/account/res/FavoriteLocation.response.dto';

export const IFavoriteLocationQueryService = Symbol(
  'IFavoriteLocationQueryService',
);

export interface IFavoriteLocationQueryService {
  getMyFavorites(
    dto: GetMyFavoritesQueryDto,
  ): Promise<Paginated<FavoriteLocationResponseDto>>;
}

export namespace IFavoriteLocationQueryService_QueryConfig {
  export function getMyFavorites(): PaginateConfig<FavoriteLocationEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: ['location'],
    };
  }
}
