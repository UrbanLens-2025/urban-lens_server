import { CoreService } from '@/common/core/Core.service';
import { GetGeneralBusinessAnalyticsResponseDto } from '@/common/dto/business/analytics/GetGeneralBusinessAnalytics.response.dto';
import { CheckInRepositoryProvider } from '@/modules/business/infra/repository/CheckIn.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { IBusinessAnalyticsService } from '@/modules/dashboard/app/IBusinessAnalytics.service';
import { LocationMissionRepositoryProvider } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { LocationVoucherRepositoryProvider } from '@/modules/gamification/infra/repository/LocationVoucher.repository';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { AnnouncementRepository } from '@/modules/post/infra/repository/Announcement.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessAnalyticsService
  extends CoreService
  implements IBusinessAnalyticsService
{
  async getGeneralBusinessAnalytics(
    locationId: string,
  ): Promise<GetGeneralBusinessAnalyticsResponseDto> {
    const missionRepository = LocationMissionRepositoryProvider(
      this.dataSource,
    );
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    const announcementRepository = AnnouncementRepository(this.dataSource);
    const voucherRepository = LocationVoucherRepositoryProvider(
      this.dataSource,
    );
    const checkInRepository = CheckInRepositoryProvider(this.dataSource);

    const location = await locationRepository.findOneOrFail({
      where: {
        id: locationId,
      },
      relations: {
        bookings: {
          fines: true,
        },
      },
    });

    const checkIns = await checkInRepository.count({
      where: {
        locationId: locationId,
      },
    });

    const revenue = location.bookings.reduce(
      (acc, booking) =>
        acc +
        LocationBookingEntity.calculateAmountToReceive(
          booking.amountToPay,
          booking.refundedAmount,
          booking.systemCutPercentage,
          booking.fines,
        ),
      0,
    );

    const announcements = await announcementRepository.count({
      where: {
        locationId: locationId,
      },
    });

    const vouchers = await voucherRepository.count({
      where: {
        locationId: locationId,
      },
    });

    const missions = await missionRepository.count({
      where: {
        locationId: locationId,
      },
    });

    return this.mapTo(GetGeneralBusinessAnalyticsResponseDto, {
      checkIns,
      revenue,
      announcements,
      vouchers,
      missions,
    });
  }
}
