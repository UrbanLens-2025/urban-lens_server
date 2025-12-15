import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PENALTY_ADMINISTERED_EVENT,
  PenaltyAdministeredEvent,
} from '@/modules/report/domain/events/PenaltyAdministered.event';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class PenaltyAdministeredListener extends CoreService {
  constructor() {
    super();
  }

  @OnEvent(PENALTY_ADMINISTERED_EVENT)
  async handlePenaltyAdministered(event: PenaltyAdministeredEvent) {
    // TODO: Implement
  }
}

