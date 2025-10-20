import { CoreService } from '@/common/core/Core.service';
import { ICheckInFraudDetectionService } from '@/modules/business/app/ICheckInFraudDetection.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckInFraudDetectionService
  extends CoreService
  implements ICheckInFraudDetectionService
{
  validateCheckIn(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}
