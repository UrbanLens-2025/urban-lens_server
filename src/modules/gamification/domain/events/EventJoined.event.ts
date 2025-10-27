export class EventJoinedEvent {
  constructor(
    public readonly userId: string,
    public readonly eventId: string,
    public readonly locationId: string,
  ) {}
}
