export class LocationFollowedEvent {
  constructor(
    public readonly userId: string,
    public readonly locationId: string,
  ) {}
}
