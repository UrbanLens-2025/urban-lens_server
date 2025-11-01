import { CoreService } from '@/common/core/Core.service';
import { IEventRequestQueryService } from '@/modules/event/app/IEventRequestQuery.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventRequestQueryService
  extends CoreService
  implements IEventRequestQueryService {}
