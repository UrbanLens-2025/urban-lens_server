/**
 * REMEMBER TO CALL THE ACK OR NACK FUNCTION TO AVOID MESSAGE LOSS
 */
export class DelayedMessageResponseWrapper<T> {
  constructor(
    public readonly nackFn: () => void,
    public readonly ackFn: () => void,
    public readonly content: T,
  ) {}

  nack() {
    this.nackFn();
  }

  ack() {
    this.ackFn();
  }
}
