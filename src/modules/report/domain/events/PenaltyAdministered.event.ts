export const PENALTY_ADMINISTERED_EVENT = 'penalty.administered';

export class PenaltyAdministeredEvent {
  constructor(
    public readonly penaltyId: string,
    public readonly administeredToId: string,
  ) {}
}
