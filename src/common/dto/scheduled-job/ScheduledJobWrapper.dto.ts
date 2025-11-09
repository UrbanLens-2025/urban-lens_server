export class ScheduledJobWrapperDto<T> {
  constructor(
    public readonly jobId: number,
    public readonly payload: T,
  ) {}
}
