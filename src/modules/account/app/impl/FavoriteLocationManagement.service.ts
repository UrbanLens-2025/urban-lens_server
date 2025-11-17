import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFavoriteLocationManagementService } from '../IFavoriteLocationManagement.service';
import { FavoriteLocationRepository } from '@/modules/account/infra/repository/FavoriteLocation.repository';
import { AddLocationToFavoritesDto } from '@/common/dto/account/AddLocationToFavorites.dto';
import { RemoveLocationFromFavoritesDto } from '@/common/dto/account/RemoveLocationFromFavorites.dto';
import { CoreService } from '@/common/core/Core.service';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { FavoriteLocationResponseDto } from '@/common/dto/account/res/FavoriteLocation.response.dto';
import { FavoriteLocationEntity } from '@/modules/account/domain/FavoriteLocation.entity';

@Injectable()
export class FavoriteLocationManagementService
  extends CoreService
  implements IFavoriteLocationManagementService
{
  async addToFavorites(
    dto: AddLocationToFavoritesDto,
  ): Promise<FavoriteLocationResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const favoriteLocationRepository = FavoriteLocationRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const location = await locationRepository.findOneOrFail({
        where: { id: dto.locationId },
      });

      // check if location is already in favorites
      const existingFavorite = await favoriteLocationRepository.findOne({
        where: {
          accountId: dto.accountId,
          locationId: location.id,
        },
      });

      if (existingFavorite) {
        throw new BadRequestException('Location already in favorites');
      }

      const favoriteLocation = new FavoriteLocationEntity();
      favoriteLocation.accountId = dto.accountId;
      favoriteLocation.location = location;

      return favoriteLocationRepository
        .save(favoriteLocation)
        .then((res) => this.mapTo(FavoriteLocationResponseDto, res));
    });
  }

  async removeFromFavorites(
    dto: RemoveLocationFromFavoritesDto,
  ): Promise<FavoriteLocationResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const favoriteLocationRepository = FavoriteLocationRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const location = await locationRepository.findOneOrFail({
        where: { id: dto.locationId },
      });

      // check if location is in favorites
      const existingFavorite = await favoriteLocationRepository.findOne({
        where: {
          accountId: dto.accountId,
          locationId: location.id,
        },
      });

      if (!existingFavorite) {
        throw new NotFoundException('Favorite not found');
      }

      return favoriteLocationRepository
        .remove(existingFavorite)
        .then((res) => this.mapTo(FavoriteLocationResponseDto, res));
    });
  }
}
