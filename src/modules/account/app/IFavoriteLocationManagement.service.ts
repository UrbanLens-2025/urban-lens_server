import { AddLocationToFavoritesDto } from '@/common/dto/account/AddLocationToFavorites.dto';
import { RemoveLocationFromFavoritesDto } from '@/common/dto/account/RemoveLocationFromFavorites.dto';
import { FavoriteLocationResponseDto } from '@/common/dto/account/res/FavoriteLocation.response.dto';

export const IFavoriteLocationManagementService = Symbol(
  'IFavoriteLocationManagementService',
);

export interface IFavoriteLocationManagementService {
  addToFavorites(
    dto: AddLocationToFavoritesDto,
  ): Promise<FavoriteLocationResponseDto>;
  removeFromFavorites(
    dto: RemoveLocationFromFavoritesDto,
  ): Promise<FavoriteLocationResponseDto>;
}
