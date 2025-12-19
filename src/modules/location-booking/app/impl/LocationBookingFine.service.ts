import { CoreService } from '@/common/core/Core.service';
import { CreateFineForBookingDto } from '@/common/dto/location-booking/CreateFineForBooking.dto';
import { GetFinesByBookingIdDto } from '@/common/dto/location-booking/GetFinesByBookingId.dto';
import { LocationBookingFineResponseDto } from '@/common/dto/location-booking/res/LocationBookingFine.response.dto';
import { UpdateFineDto } from '@/common/dto/location-booking/UpdateFine.dto';
import { isNotBlank } from '@/common/utils/is-not-blank.util';
import { ILocationBookingFineService } from '@/modules/location-booking/app/ILocationBookingFine.service';
import { LocationBookingFineEntity } from '@/modules/location-booking/domain/LocationBookingFine.entity';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationBookingFineRepository } from '@/modules/location-booking/infra/repository/LocationBookingFine.repository';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class LocationBookingFineService
  extends CoreService
  implements ILocationBookingFineService
{
  createFineForBooking(
    dto: CreateFineForBookingDto,
  ): Promise<LocationBookingFineResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingFineRepo = LocationBookingFineRepository(em);
      const locationBookingRepo = LocationBookingRepository(em);

      const locationBooking = await locationBookingRepo.findOneOrFail({
        where: {
          id: dto.bookingId,
        },
      });

      if (!locationBooking.canAddFine()) {
        throw new BadRequestException('You cannot add a fine to this booking');
      }

      if (dto.fineAmount > locationBooking.amountToPay) {
        throw new BadRequestException(
          'Fine amount cannot be greater than the booking amount',
        );
      }

      const fine = new LocationBookingFineEntity();
      fine.bookingId = dto.bookingId;
      fine.fineAmount = dto.fineAmount;
      fine.fineReason = dto.fineReason;
      fine.createdById = dto.createdById;

      return locationBookingFineRepo.save(fine);
    }).then((res) => this.mapTo(LocationBookingFineResponseDto, res));
  }

  updateFine(dto: UpdateFineDto): Promise<LocationBookingFineResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingFineRepo = LocationBookingFineRepository(em);

      const bookingFine = await locationBookingFineRepo.findOneOrFail({
        where: {
          id: dto.fineId,
        },
        relations: {
          booking: true,
        },
      });

      if (!bookingFine.booking.canAddFine()) {
        throw new BadRequestException('You cannot update this fine');
      }

      if (isNotBlank(dto.isActive)) {
        bookingFine.isActive = dto.isActive;
      }
      if (isNotBlank(dto.fineReason)) {
        bookingFine.fineReason = dto.fineReason;
      }

      bookingFine.updatedById = dto.updateById;

      return locationBookingFineRepo.save(bookingFine);
    }).then((res) => this.mapTo(LocationBookingFineResponseDto, res));
  }

  getFinesByBookingId(
    dto: GetFinesByBookingIdDto,
  ): Promise<LocationBookingFineResponseDto[]> {
    const locationBookingFineRepo = LocationBookingFineRepository(
      this.dataSource,
    );
    return locationBookingFineRepo
      .find({
        where: {
          bookingId: dto.bookingId,
        },
      })
      .then((res) => this.mapToList(LocationBookingFineResponseDto, res));
  }
}
